import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth';
import { authService } from './config';

// Mode développement : connexion simplifiée sans Cloud Function
export const generateShopTokenDev = async (_user: User) => {
  // En développement, on ne crée pas de connexion sur le projet shop
  // On simule simplement une connexion réussie
  console.log('Mode développement : simulation connexion shop');
  return 'dev-token-simulated';
};

export const signInDev = async (email: string, password: string) => {
  try {
    // Connexion uniquement sur le projet auth principal
    const credential = await signInWithEmailAndPassword(authService, email, password);
    console.log('Mode développement : connexion auth réussie');
    return credential.user;
  } catch (error) {
    console.error('Erreur connexion dev:', error);
    throw error;
  }
};

export const signUpDev = async (email: string, password: string) => {
  try {
    // Création compte uniquement sur le projet auth principal
    const credential = await createUserWithEmailAndPassword(authService, email, password);
    console.log('Mode développement : inscription auth réussie');
    return credential.user;
  } catch (error) {
    console.error('Erreur inscription dev:', error);
    throw error;
  }
};