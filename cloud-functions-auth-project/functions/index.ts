/**
 * CLOUD FUNCTION À DÉPLOYER DANS LE PROJET FIREBASE AUTH EXISTANT
 * Cette fonction génère un custom token pour permettre l'authentification
 * cross-project vers le projet SmarTeen Shop
 */

import { https, auth } from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// Initialisation admin SDK
admin.initializeApp();

// Configuration du projet Shop
const SHOP_PROJECT_ID = 'smarteen-data';

// Initialisation de l'app admin pour le projet Shop
const shopApp = admin.initializeApp({
  projectId: SHOP_PROJECT_ID,
  // Vous devrez configurer un service account pour le projet Shop
  // et l'utiliser ici pour pouvoir générer des custom tokens
}, 'shop');

export const generateSmarTeenToken = https
  .onCall(async (_data: any, context: https.CallableContext) => {
  // Vérification que l'utilisateur est authentifié
  if (!context.auth) {
    throw new https.HttpsError(
      'unauthenticated',
      'L\'utilisateur doit être authentifié pour accéder à cette fonction'
    );
  }

  const uid = context.auth.uid;
  const email = context.auth.token.email;

  try {
    // Récupération des informations utilisateur depuis le projet Auth
    const userRecord = await admin.auth().getUser(uid);

    // Création des custom claims pour le projet Shop
    const customClaims = {
      smarteenAccess: true,
      fromMobileApp: true,
      email: email || userRecord.email,
      uid: uid,
    };

    // Génération du custom token pour le projet Shop
    const customToken = await shopApp.auth().createCustomToken(uid, customClaims);

    return {
      success: true,
      customToken: customToken,
    };
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    throw new https.HttpsError(
      'internal',
      'Erreur lors de la génération du token d\'authentification'
    );
  }
});

// Fonction optionnelle pour nettoyer les données utilisateur lors de la suppression
export const onUserDeleted = auth.user().onDelete(async (user: admin.auth.UserRecord) => {
  console.log(`Utilisateur ${user.uid} supprimé du projet Auth`);
  
  // Vous pouvez ajouter ici la logique pour supprimer les données
  // de l'utilisateur dans le projet Shop si nécessaire
  
  return null;
});