import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ClientLayout } from '@/components/layout/client-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmarTeen - Le premier smartphone conçu pour les enfants',
  description: 'SmarTeen Phone : le smartphone sécurisé pour les 8-14 ans avec contrôle parental intégré et services éducatifs',
  keywords: 'smartphone enfant, contrôle parental, téléphone sécurisé, SmarTeen',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}