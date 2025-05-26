'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { shopDb } from '@/lib/firebase/config';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserProfile, updateUserPassword } from '@/lib/firebase/users';
import { useToast } from '@/components/ui/use-toast';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { authService } from '@/lib/firebase/config';

export default function AccountPage() {
  const { user, smarteenUser, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    childrenCount: 0,
    ordersCount: 0,
    activeSubscriptions: 0
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'FR'
    }
  });

  useEffect(() => {
    // Give auth state time to initialize
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
      if (!isAuthenticated) {
        router.push('/auth/login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Pré-remplir le formulaire avec les données existantes
    if (smarteenUser?.profile) {
      setFormData({
        firstName: smarteenUser.profile.firstName || '',
        lastName: smarteenUser.profile.lastName || '',
        phone: smarteenUser.profile.phone || '',
        address: {
          street: smarteenUser.profile.address?.street || '',
          city: smarteenUser.profile.address?.city || '',
          postalCode: smarteenUser.profile.address?.postalCode || '',
          country: smarteenUser.profile.address?.country || 'FR'
        }
      });
    }
  }, [smarteenUser]);

  // Récupérer les statistiques utilisateur
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.uid) return;

      try {
        // Compter les enfants depuis la sous-collection
        const childrenQuery = query(
          collection(shopDb, 'smarteenUsers', user.uid, 'children')
        );
        const childrenSnapshot = await getDocs(childrenQuery);
        const childrenCount = childrenSnapshot.size;

        // Compter les commandes
        const ordersQuery = query(
          collection(shopDb, 'smarteenOrders'),
          where('userId', '==', user.uid)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersCount = ordersSnapshot.size;

        // Compter les abonnements actifs
        const subscriptionsQuery = query(
          collection(shopDb, 'smarteenSubscriptions'),
          where('userId', '==', user.uid),
          where('status', '==', 'active')
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        const activeSubscriptions = subscriptionsSnapshot.size;

        setStats({
          childrenCount,
          ordersCount,
          activeSubscriptions
        });
      } catch (error) {
        console.error('Erreur récupération stats:', error);
      }
    };

    if (user && isAuthenticated) {
      fetchStats();
    }
  }, [user, smarteenUser, isAuthenticated]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateUserProfile(user!.uid, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address
      });

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos informations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Réauthentifier l'utilisateur
      const credential = EmailAuthProvider.credential(
        user!.email!,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(authService.currentUser!, credential);
      
      // Mettre à jour le mot de passe
      await updateUserPassword(passwordData.newPassword);

      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès.",
      });

      setIsPasswordModalOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      toast({
        title: "Erreur",
        description: error.code === 'auth/wrong-password' 
          ? "Le mot de passe actuel est incorrect."
          : "Impossible de changer le mot de passe.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  if (isCheckingAuth || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Mon compte</h2>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Nom :</span> {smarteenUser?.profile?.firstName || 'Non renseigné'} {smarteenUser?.profile?.lastName || ''}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email :</span> {user.email || 'Non renseigné'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Téléphone :</span> {smarteenUser?.profile?.phone || 'Non renseigné'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Adresse :</span> {smarteenUser?.profile?.address?.street ? 
                `${smarteenUser.profile.address.street}, ${smarteenUser.profile.address.postalCode} ${smarteenUser.profile.address.city}` : 
                'Non renseignée'}
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={handleOpenModal}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Modifier mes informations →
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Changer mon mot de passe →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/account/children" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Mes enfants</h3>
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <p className="text-sm text-gray-600">
              {stats.childrenCount} enfant(s) enregistré(s)
            </p>
            <p className="mt-2 text-primary-600 text-sm font-medium">
              Gérer →
            </p>
          </Link>

          <Link href="/account/orders" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Mes commandes</h3>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-sm text-gray-600">
              {stats.ordersCount} commande(s)
            </p>
            <p className="mt-2 text-primary-600 text-sm font-medium">
              Voir tout →
            </p>
          </Link>

          <Link href="/account/subscription" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Mes abonnements</h3>
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-sm text-gray-600">
              {stats.activeSubscriptions} abonnement(s) actif(s)
            </p>
            <p className="mt-2 text-primary-600 text-sm font-medium">
              Gérer →
            </p>
          </Link>
        </div>

        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Découvrez le SmarTeen Phone
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Le smartphone sécurisé conçu spécialement pour les 8-14 ans
          </p>
          <Link
            href="/smarteen-phone"
            className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm font-medium"
          >
            En savoir plus
          </Link>
        </div>
      </div>

      {/* Modal de modification du profil */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier mes informations</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Adresse</h4>
              <div>
                <Label htmlFor="street">Rue</Label>
                <Input
                  id="street"
                  type="text"
                  placeholder="123 rue de la Paix"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value } 
                  })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    placeholder="75001"
                    value={formData.address.postalCode}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, postalCode: e.target.value } 
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Paris"
                    value={formData.address.city}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, city: e.target.value } 
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de changement de mot de passe */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Changer mon mot de passe</DialogTitle>
            <DialogDescription>
              Pour des raisons de sécurité, veuillez entrer votre mot de passe actuel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}