import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { onAuthChanged } from '@/lib/firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { shopDb } from '@/lib/firebase/config';
import { SmarTeenUser } from '@/types';

export const useAuth = () => {
  const { 
    user, 
    smarteenUser,
    isAuthenticated, 
    isShopAuthenticated,
    setUser,
    setSmartteenUser,
    login,
    loginWithGoogle,
    register,
    logout,
    resetUserPassword
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (user, isShopAuth) => {
      setUser(user, isShopAuth);
      
      if (user && isShopAuth) {
        // Récupérer les données utilisateur depuis Firestore
        try {
          const userDoc = await getDoc(doc(shopDb, 'smarteenUsers', user.uid));
          if (userDoc.exists()) {
            setSmartteenUser(userDoc.data() as SmarTeenUser);
          } else {
            // Si le document n'existe pas, c'est un nouvel utilisateur
            // On ne crée pas le document ici, cela sera fait lors de l'inscription
            setSmartteenUser(null);
          }
        } catch (error) {
          console.error('Erreur récupération données utilisateur:', error);
          setSmartteenUser(null);
        }
      } else {
        setSmartteenUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setSmartteenUser]);

  return {
    user,
    smarteenUser,
    isAuthenticated,
    isShopAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword: resetUserPassword
  };
};