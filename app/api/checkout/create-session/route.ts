import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { doc, setDoc } from 'firebase/firestore';
import { shopDb } from '@/lib/firebase/config';
import { generateOrderNumber } from '@/lib/utils';
import { addOrderToBatch } from '@/lib/batch-orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingAddress, phone, userId, userEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun article dans le panier' },
        { status: 400 }
      );
    }

    // Pour l'instant, on ne gère qu'un seul téléphone par commande
    const item = items[0];

    // Convertir la date de naissance en objet Date si nécessaire
    const childConfig = {
      ...item.childConfig,
      birthDate: new Date(item.childConfig.birthDate)
    };

    // Créer la session Stripe Checkout
    const session = await createCheckoutSession({
      userId,
      userEmail,
      child: childConfig,
      shippingAddress,
    });

    // Créer un brouillon de commande dans Firestore
    const orderData = {
      orderNumber: generateOrderNumber(),
      userId,
      status: 'pending',
      product: {
        name: 'SmarTeen Phone',
        devicePrice: 289,
        subscriptionPrice: 9.99,
      },
      child: {
        firstName: item.childConfig.firstName,
        age: new Date().getFullYear() - new Date(item.childConfig.birthDate).getFullYear(),
        protectionLevel: item.childConfig.protectionLevel,
      },
      shipping: {
        address: shippingAddress,
        phone,
      },
      stripe: {
        checkoutSessionId: session.id,
      },
      timeline: {
        ordered: new Date(),
      },
    };

    await setDoc(doc(shopDb, 'smarteenOrders', session.id), orderData);

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Erreur création session checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}