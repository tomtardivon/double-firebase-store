import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Configuration pour le projet Auth existant
const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_AUTH,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_AUTH,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_AUTH,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_AUTH,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_AUTH,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_AUTH,
};

// Configuration pour le nouveau projet Shop
const shopConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_SHOP,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_SHOP,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_SHOP,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_SHOP,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_SHOP,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_SHOP,
};

let authApp: FirebaseApp;
let shopApp: FirebaseApp;
let authService: Auth;
let shopAuth: Auth;
let shopDb: Firestore;
let shopStorage: FirebaseStorage;

// Initialisation des apps Firebase
if (!getApps().length) {
  authApp = initializeApp(authConfig, 'auth');
  shopApp = initializeApp(shopConfig, 'shop');
} else {
  const apps = getApps();
  authApp = apps.find(app => app.name === 'auth') || initializeApp(authConfig, 'auth');
  shopApp = apps.find(app => app.name === 'shop') || initializeApp(shopConfig, 'shop');
}

// Services du projet Auth
authService = getAuth(authApp);

// Services du projet Shop
shopAuth = getAuth(shopApp);
shopDb = getFirestore(shopApp);
shopStorage = getStorage(shopApp);

export { authService, shopAuth, shopDb, shopStorage, authApp, shopApp };

// Alias pour compatibilité
export const auth = authService;
export const db = shopDb;