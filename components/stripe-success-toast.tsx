'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Toast } from '@/components/ui/toast';

export function StripeSuccessToast() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (success === 'true') {
      // Afficher un toast de succès
      console.log('Paiement réussi !');
    } else if (canceled === 'true') {
      // Afficher un toast d'annulation
      console.log('Paiement annulé');
    }
  }, [success, canceled]);

  if (success === 'true') {
    return (
      <Toast
        message="Commande confirmée ! Vous allez recevoir un email de confirmation."
        type="success"
        duration={5000}
      />
    );
  }

  if (canceled === 'true') {
    return (
      <Toast
        message="Paiement annulé. Votre panier a été conservé."
        type="info"
        duration={5000}
      />
    );
  }

  return null;
}