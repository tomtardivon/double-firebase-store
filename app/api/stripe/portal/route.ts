import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID requis' },
        { status: 400 }
      );
    }

    // Créer une session de portail client Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account/subscription`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Erreur création session portail:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}