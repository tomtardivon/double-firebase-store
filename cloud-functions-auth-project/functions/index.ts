/**
 * CLOUD FUNCTION À DÉPLOYER DANS LE FIREBASE AUTH EXISTANT
 * Cette fonction génère un custom token pour permettre l'authentification
 * cross-project vers le projet SmarTeen Shop
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialisation admin SDK pour le projet Auth
admin.initializeApp();

// Configuration du projet Shop
const SHOP_PROJECT_ID = 'smarteen-data'; // Projet qui stocke les données du shop

// Initialisation de l'app admin pour le projet Shop avec le service account
// IMPORTANT: Nous utilisons le service account Firebase Admin SDK par défaut
// car il a les permissions nécessaires pour générer des custom tokens
const firebaseAdminServiceAccountPath = path.join(__dirname, 'firebase-admin-service-account.json');
const shopApp = admin.initializeApp({
  credential: admin.credential.cert(firebaseAdminServiceAccountPath),
  projectId: SHOP_PROJECT_ID,
}, 'shop');

export const generateSmarTeenToken = functions
  .region('europe-west1')
  .https.onCall(async (_data: any, context: functions.https.CallableContext) => {
  // Vérification que l'utilisateur est authentifié
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'L\'utilisateur doit être authentifié pour accéder à cette fonction'
    );
  }

  const uid = context.auth.uid;
  const email = context.auth.token.email;

  try {
    // Récupération des informations utilisateur depuis le Firebase Auth
    const userRecord = await admin.auth().getUser(uid);

    // Création des custom claims pour le Firebase Shop (data)
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
    throw new functions.https.HttpsError(
      'internal',
      'Erreur lors de la génération du token d\'authentification'
    );
  }
});

// Fonction pour nettoyer les données utilisateur lors de la suppression
/* export const onUserDeleted = functions
  .region('europe-west1')
  .auth.user().onDelete(async (user: admin.auth.UserRecord) => {
  console.log(`Utilisateur ${user.uid} supprimé du projet Auth`);
  
  
  return null;
}); */