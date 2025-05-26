'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, calculateAge } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { getStripePublishableKey } from '@/lib/stripe/config';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Truck, Shield } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, smarteenUser } = useAuth();
  const { items, getTotal } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/auth/login?callbackUrl=/checkout');
      } else if (items.length === 0) {
        router.push('/');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, items.length, router]);

  const handleCheckout = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Créer la session de checkout Stripe
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingAddress: {
            street: smarteenUser?.profile?.address?.street || '',
            city: smarteenUser?.profile?.address?.city || '',
            postalCode: smarteenUser?.profile?.address?.postalCode || '',
            country: smarteenUser?.profile?.address?.country || 'FR',
          },
          phone: smarteenUser?.profile?.phone || '',
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }

      const { sessionId } = await response.json();

      // Rediriger vers Stripe Checkout
      const stripe = await loadStripe(getStripePublishableKey());
      if (!stripe) throw new Error('Stripe non disponible');

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const total = getTotal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8 text-center">Finaliser votre commande</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Récapitulatif commande */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Récapitulatif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between py-3 border-b"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-gray-600">
                            Pour {item.childConfig.firstName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {calculateAge(new Date(item.childConfig.birthDate))} ans • 
                            Protection {item.childConfig.protectionLevel === 'strict' ? 'stricte' : 'modérée'}
                          </p>
                        </div>
                        <span className="font-semibold">{formatPrice(item.price)}</span>
                      </motion.div>
                    ))}
                    
                    <div className="pt-4 space-y-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total appareil</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Abonnement services</span>
                        <span>{formatPrice(9.99)}/mois*</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        *L&apos;abonnement sera activé uniquement après la livraison
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Truck className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Livraison gratuite</h4>
                        <p className="text-sm text-gray-600">Réception sous 3-5 jours ouvrés</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Garantie 3 ans</h4>
                        <p className="text-sm text-gray-600">Incluse dans l&apos;abonnement</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CreditCard className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Paiement sécurisé</h4>
                        <p className="text-sm text-gray-600">Via Stripe, leader du paiement en ligne</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informations de paiement */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Informations de paiement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Comment ça marche ?
                      </h4>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Cliquez sur &quot;Procéder au paiement&quot;</li>
                        <li>Entrez vos informations de livraison</li>
                        <li>Payez de manière sécurisée</li>
                        <li>Recevez votre SmarTeen Phone</li>
                        <li>L&apos;abonnement démarre à la livraison</li>
                      </ol>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2">
                      <p>
                        En cliquant sur &quot;Procéder au paiement&quot;, vous serez redirigé vers 
                        notre page de paiement sécurisée Stripe où vous pourrez :
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Entrer votre adresse de livraison</li>
                        <li>Ajouter votre numéro de téléphone</li>
                        <li>Choisir votre mode de livraison</li>
                        <li>Payer par carte bancaire</li>
                      </ul>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-red-50 text-red-800 rounded-md"
                      >
                        {error}
                      </motion.div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        size="lg"
                        className="w-full"
                        disabled={isLoading}
                        onClick={handleCheckout}
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <CreditCard className="mr-2 h-5 w-5" />
                        )}
                        {isLoading ? 'Redirection...' : 'Procéder au paiement sécurisé'}
                      </Button>
                    </motion.div>

                    <p className="text-center text-xs text-gray-500">
                      Paiement 100% sécurisé par Stripe
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}