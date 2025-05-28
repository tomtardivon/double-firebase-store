import { stripe } from './config';
import { SmarTeenOrder } from '@/types';

interface CheckoutData {
  userId: string;
  userEmail: string;
  child: {
    firstName: string;
    birthDate: Date;
    protectionLevel: 'strict' | 'moderate';
  };
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone?: string;
}

export const createCheckoutSession = async (data: CheckoutData) => {
  try {
    // Créer d'abord le customer Stripe si nécessaire
    let customer;
    const customers = await stripe.customers.list({
      email: data.userEmail,
      limit: 1,
    });
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
      // Mettre à jour les informations du customer si on a des nouvelles données
      if (data.phone || data.shippingAddress.street) {
        await stripe.customers.update(customer.id, {
          phone: data.phone || undefined,
          address: data.shippingAddress.street ? {
            line1: data.shippingAddress.street,
            city: data.shippingAddress.city,
            postal_code: data.shippingAddress.postalCode,
            country: data.shippingAddress.country,
          } : undefined,
        });
      }
    } else {
      customer = await stripe.customers.create({
        email: data.userEmail,
        phone: data.phone || undefined,
        address: data.shippingAddress.street ? {
          line1: data.shippingAddress.street,
          city: data.shippingAddress.city,
          postal_code: data.shippingAddress.postalCode,
          country: data.shippingAddress.country,
        } : undefined,
        metadata: {
          userId: data.userId,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'SmarTeen Phone',
              description: 'Smartphone sécurisé pour enfants 8-14 ans',
              images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
            },
            unit_amount: 28900, // 289€ en centimes
          },
          quantity: 1,
        },
      ],
      
      // Pré-remplir avec les données existantes
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: 'Livraison gratuite',
          },
        },
      ],
      
      // Collecte des informations de livraison
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU'], // France et pays limitrophes
      },
      
      // Collecte du numéro de téléphone
      phone_number_collection: {
        enabled: true,
      },
      
      // Métadonnées pour créer la commande après paiement
      metadata: {
        userId: data.userId,
        childFirstName: data.child.firstName,
        childBirthDate: data.child.birthDate.toISOString(),
        protectionLevel: data.child.protectionLevel,
      },
      
      // Texte de consentement pour l'abonnement
      // Temporairement désactivé - à réactiver après configuration dans Stripe Dashboard
      // consent_collection: {
      //   terms_of_service: 'required',
      // },
      
      custom_text: {
        submit: {
          message: 'Important : La livraison sera effectuée dès que nous aurons suffisamment de commandes. L\'abonnement de 9,99€/mois ne démarrera qu\'après réception du téléphone.',
        },
      },
      
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
    });
    
    return session;
  } catch (error) {
    console.error('Erreur création session checkout:', error);
    throw error;
  }
};

export const createSubscriptionForOrder = async (
  customerId: string,
  orderId: string
) => {
  try {
    // Utiliser le produit existant dans Stripe
    const SMARTEEN_SERVICES_PRODUCT_ID = process.env.STRIPE_SUBSCRIPTION_PRODUCT_ID || 'prod_SO4qCqWfPF6gYh';
    
    // Récupérer ou créer le prix pour l'abonnement
    // D'abord vérifier s'il existe déjà un prix récurrent pour ce produit
    const existingPrices = await stripe.prices.list({
      product: SMARTEEN_SERVICES_PRODUCT_ID,
      type: 'recurring',
      active: true,
      limit: 1,
    });
    
    let priceId: string;
    
    if (existingPrices.data.length > 0 && 
        existingPrices.data[0].unit_amount === 999 && 
        existingPrices.data[0].recurring?.interval === 'month') {
      // Utiliser le prix existant
      priceId = existingPrices.data[0].id;
    } else {
      // Créer un nouveau prix pour ce produit
      const price = await stripe.prices.create({
        currency: 'eur',
        unit_amount: 999, // 9.99€
        recurring: {
          interval: 'month',
        },
        product: SMARTEEN_SERVICES_PRODUCT_ID,
      });
      priceId = price.id;
    }
    
    // Créer l'abonnement en mode PAUSÉ
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        orderId: orderId,
        activationType: 'delivery_triggered',
      },
      // Pour mettre en pause, on crée avec une période d'essai très longue
      trial_end: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 an
    });
    
    return subscription;
  } catch (error) {
    console.error('Erreur création abonnement:', error);
    throw error;
  }
};

export const activateSubscriptionOnDelivery = async (
  subscriptionId: string
) => {
  try {
    // Réactiver l'abonnement en terminant la période d'essai
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      trial_end: 'now',
    });
    
    return subscription;
  } catch (error) {
    console.error('Erreur activation abonnement:', error);
    throw error;
  }
};