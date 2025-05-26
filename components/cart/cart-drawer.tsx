'use client';

import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const total = mounted ? getTotal() : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    toggleCart();
    router.push('/checkout');
  };

  if (!mounted || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 z-50"
            onClick={toggleCart}
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50"
          >
            <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Mon panier</h2>
            <div className="flex items-center space-x-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded"
                >
                  Vider
                </button>
              )}
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Votre panier est vide</p>
                <Link href="/smarteen-phone">
                  <Button className="mt-4" onClick={toggleCart}>
                    Découvrir le SmarTeen Phone
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg"
                    >
                    <div className="flex-1">
                      <h3 className="font-medium">{item.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Pour {item.childConfig.firstName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Protection {item.childConfig.protectionLevel === 'strict' ? 'stricte' : 'modérée'}
                      </p>
                      <p className="font-semibold mt-2">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Retirer
                    </button>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-sm text-gray-600">
                + Abonnement services 9,99€/mois (activé à la livraison)
              </p>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
              >
                Procéder au paiement
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )}
  </AnimatePresence>
  );
}