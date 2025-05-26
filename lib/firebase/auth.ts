import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  signInWithCustomToken
} from 'firebase/auth';
import { authService, shopAuth } from './config';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from 'firebase/functions';
import { signInDev, signUpDev, generateShopTokenDev } from './auth-dev';

// Cache pour éviter les connexions multiples
let isConnectingToShop = false;
let lastShopConnectionUid: string | null = null;

// Génération du token pour le projet shop
export const generateShopToken = async (user: User) => {
  // En mode développement, utiliser la connexion simplifiée
  if (process.env.NODE_ENV !== 'production') {
    return generateShopTokenDev(user);
  }
  
  try {
    // Appel à la Cloud Function du projet auth existant
    const functions = getFunctions(authService.app, 'europe-west1');
    const generateToken = httpsCallable(functions, 'generateSmarTeenToken');
    const result = await generateToken({ uid: user.uid });
    
    return (result.data as any).customToken;
  } catch (error) {
    console.error('Erreur génération token shop:', error);
    // Fallback en mode dev si la Cloud Function n'est pas disponible
    if (process.env.NODE_ENV !== 'production') {
      console.log('Fallback vers connexion dev');
      return generateShopTokenDev(user);
    }
    throw error;
  }
};

// Connexion
export const signIn = async (email: string, password: string) => {
  // En mode développement, utiliser la connexion simplifiée
  if (process.env.NODE_ENV !== 'production') {
    return signInDev(email, password);
  }
  
  try {
    // 1. Connexion sur le projet auth principal
    const credential = await signInWithEmailAndPassword(authService, email, password);
    
    // 2. Génération du token pour le projet shop
    const shopToken = await generateShopToken(credential.user);
    
    // 3. Connexion sur le projet shop avec le custom token
    if (typeof shopToken === 'string' && process.env.NODE_ENV === 'production') {
      await signInWithCustomToken(shopAuth, shopToken);
    }
    
    return credential.user;
  } catch (error) {
    console.error('Erreur connexion:', error);
    throw error;
  }
};

// Inscription
export const signUp = async (email: string, password: string) => {
  // En mode développement, utiliser la connexion simplifiée
  if (process.env.NODE_ENV !== 'production') {
    return signUpDev(email, password);
  }
  
  try {
    // 1. Création compte sur le projet auth principal
    const credential = await createUserWithEmailAndPassword(authService, email, password);
    
    // 2. Génération du token pour le projet shop
    const shopToken = await generateShopToken(credential.user);
    
    // 3. Connexion sur le projet shop
    if (typeof shopToken === 'string' && process.env.NODE_ENV === 'production') {
      await signInWithCustomToken(shopAuth, shopToken);
    }
    
    return credential.user;
  } catch (error) {
    console.error('Erreur inscription:', error);
    throw error;
  }
};

// Déconnexion
export const signOut = async () => {
  try {
    await firebaseSignOut(authService);
    await firebaseSignOut(shopAuth);
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    throw error;
  }
};

// Réinitialisation mot de passe
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(authService, email);
  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error);
    throw error;
  }
};

// Observer l'état d'authentification
export const onAuthChanged = (callback: (user: User | null, isShopAuthenticated: boolean) => void) => {
  return onAuthStateChanged(authService, async (user) => {
    if (user) {
      try {
        // Éviter les connexions multiples pour le même utilisateur
        if (isConnectingToShop || lastShopConnectionUid === user.uid) {
          callback(user, true);
          return;
        }
        
        isConnectingToShop = true;
        lastShopConnectionUid = user.uid;
        
        // Si utilisateur connecté sur auth principal, se connecter aussi sur shop
        const shopToken = await generateShopToken(user);
        // En mode dev, le token est simulé, donc on ne fait pas la connexion réelle
        if (typeof shopToken === 'string' && process.env.NODE_ENV === 'production') {
          await signInWithCustomToken(shopAuth, shopToken);
        }
        
        isConnectingToShop = false;
        callback(user, true);
      } catch (error) {
        console.error('Erreur authentification shop:', error);
        isConnectingToShop = false;
        
        // En mode dev, on considère l'auth comme réussie même sans Cloud Function
        if (process.env.NODE_ENV !== 'production') {
          callback(user, true);
        } else {
          callback(user, false);
        }
      }
    } else {
      lastShopConnectionUid = null;
      callback(null, false);
    }
  });
};