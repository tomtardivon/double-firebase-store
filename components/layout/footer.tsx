import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-2xl font-bold mb-4">SmarTeen</h3>
            <p className="text-gray-400 text-sm">
              Le premier smartphone conçu spécialement pour les enfants de 8 à 14 ans.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Produit</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/smarteen-phone" className="hover:text-white">
                  SmarTeen Phone
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  Tarifs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/expertise" className="hover:text-white">
                  Articles experts
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/legal/privacy" className="hover:text-white">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-white">
                  CGV
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-white">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>© 2024 SmarTeen. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}