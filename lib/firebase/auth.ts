import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { authService, shopAuth } from "./config";
import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";
// Mode dev supprimé - utilisation uniquement de la Cloud Function
//import { signInDev, signUpDev, generateShopTokenDev } from './auth-dev';

// Cache pour éviter les connexions multiples
let isConnectingToShop = false;
let lastShopConnectionUid: string | null = null;

// Provider Google
const googleProvider = new GoogleAuthProvider();

// Génération du token pour le projet shop
export const generateShopToken = async (user: User) => {
  // En mode développement, utiliser la connexion simplifiée
  /*   if (process.env.NODE_ENV !== 'production') {
    return generateShopTokenDev(user);
  } */

  try {
    console.log(
      "[generateShopToken] Appel de la Cloud Function pour générer le custom token..."
    );
    // Appel à la Cloud Function du projet auth existant
    const functions = getFunctions(authService.app, "europe-west1");
    const generateToken = httpsCallable(functions, "generateSmarTeenToken");
    const result = await generateToken({ uid: user.uid });

    console.log("[generateShopToken] Custom token généré avec succès");
    return (result.data as any).customToken;
  } catch (error) {
    console.error("[generateShopToken] Erreur génération token shop:", error);
    throw error;
  }
};

// Connexion
export const signIn = async (email: string, password: string) => {
  try {
    console.log("[signIn] Début de la connexion...");
    // 1. Connexion sur le projet auth principal
    const credential = await signInWithEmailAndPassword(
      authService,
      email,
      password
    );
    console.log(
      "[signIn] Connexion au projet Auth réussie:",
      credential.user.uid
    );

    // 2. Génération du token pour le projet shop
    const shopToken = await generateShopToken(credential.user);

    // 3. Connexion sur le projet shop avec le custom token
    if (typeof shopToken === "string") {
      console.log("[signIn] Connexion au projet Shop avec le custom token...");
      await signInWithCustomToken(shopAuth, shopToken);
      console.log("[signIn] Connexion au projet Shop réussie");
    }

    return credential.user;
  } catch (error) {
    console.error("[signIn] Erreur connexion:", error);
    throw error;
  }
};

// Inscription
export const signUp = async (email: string, password: string) => {
  try {
    console.log("[signUp] Création du compte...");
    // 1. Création compte sur le projet auth principal
    const credential = await createUserWithEmailAndPassword(
      authService,
      email,
      password
    );
    console.log(
      "[signUp] Compte créé sur le projet Auth:",
      credential.user.uid
    );

    // 2. Génération du token pour le projet shop
    const shopToken = await generateShopToken(credential.user);

    // 3. Connexion sur le projet shop
    if (typeof shopToken === "string") {
      console.log("[signUp] Connexion au projet Shop avec le custom token...");
      await signInWithCustomToken(shopAuth, shopToken);
      console.log("[signUp] Connexion au projet Shop réussie");
    }

    return credential.user;
  } catch (error) {
    console.error("[signUp] Erreur inscription:", error);
    throw error;
  }
};

// Connexion avec Google
export const signInWithGoogle = async () => {
  try {
    // 1. Connexion avec Google sur le projet auth principal
    const result = await signInWithPopup(authService, googleProvider);
    const user = result.user;

    // 2. Vérifier si c'est un nouvel utilisateur
    const isNewUser = (result as any)._tokenResponse?.isNewUser || false;

    // 3. Génération du token pour le projet shop
    const shopToken = await generateShopToken(user);

    // 4. Connexion sur le projet shop
    if (typeof shopToken === "string") {
      console.log(
        "[signInWithGoogle] Connexion au projet Shop avec le custom token..."
      );
      await signInWithCustomToken(shopAuth, shopToken);
      console.log("[signInWithGoogle] Connexion au projet Shop réussie");
    }

    // 5. Si c'est un nouvel utilisateur, créer son profil
    if (isNewUser) {
      const { doc, setDoc, serverTimestamp } = await import(
        "firebase/firestore"
      );
      const { shopDb } = await import("./config");

      const userDoc = {
        email: user.email,
        profile: {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        },
        children: [],
        orders: {
          totalOrders: 0,
          activeSubscriptions: 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(shopDb, "smarteenUsers", user.uid), userDoc);
    }

    return user;
  } catch (error) {
    console.error("Erreur connexion Google:", error);
    throw error;
  }
};

// Déconnexion
export const signOut = async () => {
  try {
    await firebaseSignOut(authService);
    await firebaseSignOut(shopAuth);
  } catch (error) {
    console.error("Erreur déconnexion:", error);
    throw error;
  }
};

// Réinitialisation mot de passe
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(authService, email);
  } catch (error) {
    console.error("Erreur réinitialisation mot de passe:", error);
    throw error;
  }
};

// Observer l'état d'authentification
export const onAuthChanged = (
  callback: (user: User | null, isShopAuthenticated: boolean) => void
) => {
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
        console.log(
          "[onAuthChanged] Utilisateur connecté au projet Auth, génération du token Shop..."
        );
        const shopToken = await generateShopToken(user);

        if (typeof shopToken === "string") {
          console.log(
            "[onAuthChanged] Connexion au projet Shop avec le custom token..."
          );
          await signInWithCustomToken(shopAuth, shopToken);
          console.log("[onAuthChanged] Connexion au projet Shop réussie");
        }

        isConnectingToShop = false;
        callback(user, true);
      } catch (error) {
        console.error("[onAuthChanged] Erreur authentification shop:", error);
        isConnectingToShop = false;
        callback(user, false);
      }
    } else {
      lastShopConnectionUid = null;
      callback(null, false);
    }
  });
};