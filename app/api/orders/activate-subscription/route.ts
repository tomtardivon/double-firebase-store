import { NextRequest, NextResponse } from 'next/server';
import { activateSubscriptionOnDelivery } from '@/lib/stripe/checkout';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { shopDb } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Récupérer la commande
    const orderRef = doc(shopDb, 'smarteenOrders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderSnap.data();

    // Vérifier que la commande a bien un abonnement associé
    if (!order.stripe?.subscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found for this order' },
        { status: 400 }
      );
    }

    // Vérifier que la commande est bien livrée
    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Order must be delivered before activating subscription' },
        { status: 400 }
      );
    }

    // Activer l'abonnement Stripe
    await activateSubscriptionOnDelivery(order.stripe.subscriptionId);

    // Mettre à jour le statut de la commande
    await updateDoc(orderRef, {
      status: 'activated',
      'timeline.subscriptionActivated': new Date(),
    });

    // Mettre à jour le statut de l'abonnement
    await updateDoc(
      doc(shopDb, 'smarteenSubscriptions', order.stripe.subscriptionId),
      {
        status: 'active',
        'activation.actualDate': new Date(),
        'activation.method': 'delivery_webhook',
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Subscription activated successfully' 
    });
  } catch (error: any) {
    console.error('Error activating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to activate subscription' },
      { status: 500 }
    );
  }
}