'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserNav } from './user-nav';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { isAuthenticated } = useAuth();
  const { toggleCart, getItemsCount } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const itemsCount = mounted ? getItemsCount() : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white border-b sticky top-0 z-50"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <Link href="/" className="flex items-center ml-2 sm:ml-0">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center"
              >
                <Image
                  src="/images/smarteen-logo.png"
                  alt="SmarTeen"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </motion.div>
            </Link>
            
            <div className="hidden sm:ml-10 sm:flex sm:items-center sm:space-x-6">
              <Link
                href="/smarteen-phone"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Le SmarTeen Phone
              </Link>
              <Link
                href="/expertise"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Expertise
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                À propos
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:gradient-text hover:bg-gray-50 rounded-lg transition-all duration-300"
            >
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence>
                {itemsCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge className="h-5 w-5 flex items-center justify-center p-0 smarteen-gradient text-white border-0">
                      {itemsCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            
            {isAuthenticated ? (
              <UserNav />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="smarteen-gradient hover:gradient-bg-hover text-white border-0 transition-all duration-300">
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t bg-white"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link
                href="/smarteen-phone"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Le SmarTeen Phone
              </Link>
              <Link
                href="/expertise"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Expertise
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                À propos
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}