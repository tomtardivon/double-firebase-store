# 📚 Documentation - Authentification Cross-Project Firebase

## 🎯 Vue d'ensemble

Cette documentation explique comment nous avons mis en place une authentification cross-project entre deux projets Firebase :
- **Projet Auth** : `test-firebase-auth-4ad79` (gère l'authentification des utilisateurs)
- **Projet Shop** : `smarteen-data` (stocke les données de l'application)

## 🏗️ Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   Projet Auth       │         │    Projet Shop       │
│ test-firebase-auth  │         │   smarteen-data      │
│                     │         │                      │
│ • Authentication    │         │ • Firestore          │
│ • Cloud Functions   │ ──────> │ • Storage            │
│ • Users management  │         │ • Business Logic     │
└─────────────────────┘         └──────────────────────┘
         │                                 ▲
         │                                 │
         └────── Custom Token ─────────────┘
```

## 🔧 Configuration mise en place

### 1. Cloud Functions (dans le projet Auth)

**Fichier** : `cloud-functions-auth-project/functions/index.ts`

```typescript
// Fonction qui génère un custom token pour le projet Shop
export const generateSmarTeenToken = functions
  .region('europe-west1')
  .https.onCall(async (_data, context) => {
    // Vérification que l'utilisateur est authentifié
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '...');
    }

    // Génération du custom token avec des claims personnalisés
    const customClaims = {
      smarteenAccess: true,
      fromMobileApp: true,
      email: email,
      uid: uid,
    };

    const customToken = await shopApp.auth().createCustomToken(uid, customClaims);
    return { success: true, customToken };
  });
```

### 2. Service Account

**IMPORTANT** : La Cloud Function utilise le service account Firebase Admin SDK du projet Shop :
- **Email** : `firebase-adminsdk-fbsvc@smarteen-data.iam.gserviceaccount.com`
- **Fichier** : `functions/firebase-admin-service-account.json`

Ce service account a les permissions nécessaires pour générer des custom tokens.

### 3. Code d'authentification côté client

**Fichier** : `lib/firebase/auth.ts`

Le flux d'authentification :
1. L'utilisateur se connecte sur le projet Auth
2. La Cloud Function est appelée automatiquement
3. Un custom token est généré
4. L'utilisateur est connecté au projet Shop avec ce token

```typescript
// Lors de la connexion
const signIn = async (email: string, password: string) => {
  // 1. Connexion au projet Auth
  const credential = await signInWithEmailAndPassword(authService, email, password);
  
  // 2. Génération du custom token via Cloud Function
  const shopToken = await generateShopToken(credential.user);
  
  // 3. Connexion au projet Shop
  await signInWithCustomToken(shopAuth, shopToken);
  
  return credential.user;
};
```

## 🚀 Déploiement des Cloud Functions

Pour déployer les Cloud Functions :

```bash
cd cloud-functions-auth-project
firebase deploy --only functions
```

**Note** : Les fonctions sont déployées dans la région `europe-west1`.

## 🔑 Points clés pour les développeurs

### 1. Deux instances Firebase distinctes

```typescript
// config.ts
export const authApp = initializeApp(authConfig, 'auth');
export const shopApp = initializeApp(shopConfig, 'shop');

export const authService = getAuth(authApp);
export const shopAuth = getAuth(shopApp);
```

### 2. Custom Claims

Les custom claims ajoutés par la Cloud Function :
- `smarteenAccess: true` - Indique que l'utilisateur a accès à l'app
- `fromMobileApp: true` - Indique la provenance de l'utilisateur
- `email` - Email de l'utilisateur
- `uid` - UID de l'utilisateur

Ces claims peuvent être utilisés dans les règles Firestore :
```javascript
// Exemple de règle Firestore
allow read: if request.auth.token.smarteenAccess == true;
```

### 3. Gestion des erreurs

Si la Cloud Function échoue, l'utilisateur :
- Reste connecté au projet Auth ✅
- N'est pas connecté au projet Shop ❌
- Voit un message d'erreur approprié

### 4. Pages de test disponibles

- `/test-auth` - Vérifie l'état de connexion sur les deux projets
- `/test-cloud-function` - Teste manuellement la Cloud Function
- `/auth-status` - Affiche des logs détaillés du processus d'authentification

## 🛠️ Configuration requise

### Projet Auth (`test-firebase-auth-4ad79`)
- Firebase Authentication activé
- Cloud Functions déployées
- Service account du projet Shop ajouté

### Projet Shop (`smarteen-data`)
- Firebase Authentication activé
- Au moins un provider activé (Email/Password)
- Identity Toolkit API activée

## 📝 Variables d'environnement

```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY_AUTH=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_AUTH=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID_AUTH=test-firebase-auth-4ad79
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_AUTH=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_AUTH=...
NEXT_PUBLIC_FIREBASE_APP_ID_AUTH=...

NEXT_PUBLIC_FIREBASE_API_KEY_SHOP=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_SHOP=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID_SHOP=smarteen-data
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_SHOP=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_SHOP=...
NEXT_PUBLIC_FIREBASE_APP_ID_SHOP=...
```

## ⚠️ Points d'attention

1. **Service Account** : Le service account doit appartenir au projet Shop et avoir les bonnes permissions
2. **Région** : Les Cloud Functions sont en `europe-west1`
3. **Mode dev supprimé** : L'authentification fonctionne uniquement avec la Cloud Function
4. **Cache** : Un système de cache évite les connexions multiples au projet Shop

## 🐛 Dépannage

### L'utilisateur n'est pas connecté au projet Shop
1. Vérifier que la Cloud Function est bien déployée
2. Vérifier les logs de la Cloud Function dans la console Firebase
3. S'assurer que le service account a les bonnes permissions

### Erreur "INVALID_CUSTOM_TOKEN"
- Le service account n'a pas les permissions nécessaires
- Utiliser le service account Firebase Admin SDK par défaut

### Les custom claims ne sont pas présents
- Vérifier que la Cloud Function les ajoute correctement
- Rafraîchir le token avec `user.getIdTokenResult(true)`

## 📞 Support

Pour toute question sur cette implémentation :
1. Consulter les logs dans la console Firebase
2. Utiliser la page `/auth-status` pour voir les logs détaillés
3. Vérifier que les deux projets Firebase sont correctement configurés