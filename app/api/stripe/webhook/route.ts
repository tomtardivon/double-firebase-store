import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { shopDb } from '@/lib/firebase/config';
import { createSubscriptionForOrder } from '@/lib/stripe/checkout';
import { updateUserProfile } from '@/lib/firebase/users';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Récupérer la commande
        const orderRef = doc(shopDb, 'smarteenOrders', session.id);
        const orderSnap = await getDoc(orderRef);
        
        if (!orderSnap.exists()) {
          console.error('Commande non trouvée:', session.id);
          break;
        }

        const customerId = session.customer as string;

        // Créer l'abonnement PAUSÉ
        const subscription = await createSubscriptionForOrder(
          customerId,
          session.id
        );

        // Mettre à jour la commande avec les informations de livraison
        const shippingDetails = session.shipping_details;
        const orderData = orderSnap.data();
        
        console.log('Session shipping_details:', JSON.stringify(shippingDetails, null, 2));
        console.log('Session customer_details:', JSON.stringify(session.customer_details, null, 2));
        
        await updateDoc(orderRef, {
          status: 'confirmed',
          'stripe.customerId': customerId,
          'stripe.subscriptionId': subscription.id,
          'stripe.paymentIntentId': session.payment_intent,
          'shipping.address': shippingDetails ? {
            street: shippingDetails.address?.line1 || '',
            city: shippingDetails.address?.city || '',
            postalCode: shippingDetails.address?.postal_code || '',
            country: shippingDetails.address?.country || 'FR',
          } : orderData.shipping.address,
          'shipping.phone': session.customer_details?.phone || '',
          'timeline.confirmed': new Date(),
          // Ajouter les liens
          'links.subscriptionId': subscription.id,
          'links.childId': session.id, // L'enfant a le même ID que la session
        });
        
        // Mettre à jour le profil utilisateur avec les informations de livraison si elles sont fournies
        if (shippingDetails && session.metadata?.userId) {
          await updateUserProfile(session.metadata.userId, {
            phone: session.customer_details?.phone || undefined,
            address: shippingDetails.address ? {
              street: shippingDetails.address.line1 || '',
              city: shippingDetails.address.city || '',
              postalCode: shippingDetails.address.postal_code || '',
              country: shippingDetails.address.country || 'FR',
            } : undefined,
          });
        }

        // Créer l'enregistrement d'abonnement
        await setDoc(doc(shopDb, 'smarteenSubscriptions', subscription.id), {
          userId: session.metadata?.userId || '',
          orderId: session.id,
          stripeSubscriptionId: subscription.id,
          status: 'pending',
          activation: {
            method: 'delivery_webhook',
          },
          billing: {
            amount: 9.99,
          },
          // Ajouter les liens
          links: {
            orderId: session.id,
            childId: session.id,
          },
        });

        // Mettre à jour l'enfant avec le lien vers l'abonnement
        if (session.metadata?.userId) {
          const childRef = doc(shopDb, 'smarteenUsers', session.metadata.userId, 'children', session.id);
          await updateDoc(childRef, {
            status: 'confirmed',
            'links.subscriptionId': subscription.id,
            'links.orderId': session.id,
            confirmedAt: new Date(),
          });
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Vérifier si l'abonnement vient d'être activé
        if (subscription.pause_collection === null && 
            subscription.status === 'active') {
          
          // Mettre à jour le statut de l'abonnement
          await updateDoc(
            doc(shopDb, 'smarteenSubscriptions', subscription.id),
            {
              status: 'active',
              'activation.actualDate': new Date(),
              'billing.nextBilling': new Date(subscription.current_period_end * 1000),
            }
          );

          // Mettre à jour la commande associée
          const orderId = subscription.metadata.orderId;
          if (orderId) {
            await updateDoc(
              doc(shopDb, 'smarteenOrders', orderId),
              {
                status: 'activated',
                'timeline.subscriptionActivated': new Date(),
              }
            );
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Mettre à jour la prochaine date de facturation
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          
          await updateDoc(
            doc(shopDb, 'smarteenSubscriptions', subscription.id),
            {
              'billing.nextBilling': new Date(subscription.current_period_end * 1000),
            }
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Mettre à jour le statut de l'abonnement
        await updateDoc(
          doc(shopDb, 'smarteenSubscriptions', subscription.id),
          {
            status: 'cancelled',
            'activation.cancelledDate': new Date(),
          }
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}