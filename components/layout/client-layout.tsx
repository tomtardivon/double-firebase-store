'use client';

import { Header } from './header';
import { Footer } from './footer';
import { CartDrawer } from '@/components/cart/cart-drawer';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <CartDrawer />
    </>
  );
}