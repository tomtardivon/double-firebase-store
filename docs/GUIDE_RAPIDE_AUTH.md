# 🚀 Guide Rapide - Authentification Cross-Project

## Ce qui a été fait

### 1. Problème initial
- Deux projets Firebase séparés (Auth + Shop)
- Besoin de connecter les utilisateurs aux deux projets
- Impossible de partager directement l'authentification

### 2. Solution implémentée
```
Utilisateur → Connexion Auth → Cloud Function → Custom Token → Connexion Shop
```

### 3. Fichiers clés modifiés

#### Cloud Function (déployée sur le projet Auth)
```
📁 cloud-functions-auth-project/functions/
  ├── index.ts                    # Cloud Function generateSmarTeenToken
  ├── firebase-admin-service-account.json  # Service account du projet Shop
  └── service-account.json        # Ancien service account (non utilisé)
```

#### Code client
```
📁 lib/firebase/
  ├── config.ts    # Configuration des deux projets Firebase
  └── auth.ts      # Logique d'authentification (modifiée pour utiliser la Cloud Function)
```

### 4. Comment ça marche

1. **Connexion utilisateur** :
   ```typescript
   signIn(email, password)
     → Connexion au projet Auth
     → Appel automatique à generateSmarTeenToken
     → Réception du custom token
     → Connexion au projet Shop
   ```

2. **Cloud Function** génère un token avec ces claims :
   ```json
   {
     "smarteenAccess": true,
     "fromMobileApp": true,
     "email": "user@example.com",
     "uid": "userId123"
   }
   ```

### 5. Points importants

⚠️ **Service Account** : On utilise `firebase-adminsdk-fbsvc@smarteen-data.iam.gserviceaccount.com`
- C'est le service account par défaut de Firebase Admin SDK
- Il a les permissions nécessaires pour créer des custom tokens

⚠️ **Pas de mode dev** : Le code utilise toujours la Cloud Function (pas de simulation)

⚠️ **Région** : Cloud Functions déployées en `europe-west1`

### 6. Pour tester

1. Page de connexion : http://localhost:3001/auth/login
2. Vérifier l'état : http://localhost:3001/test-auth
3. Logs détaillés : http://localhost:3001/auth-status

### 7. Commandes utiles

```bash
# Déployer les Cloud Functions
cd cloud-functions-auth-project
firebase deploy --only functions

# Voir les logs
firebase functions:log --only generateSmarTeenToken
```

### 8. Si ça ne marche pas

1. **Vérifier que l'utilisateur est bien connecté au projet Auth**
   - Console : https://console.firebase.google.com/project/test-firebase-auth-4ad79/authentication

2. **Vérifier que la Cloud Function est appelée**
   - Logs : https://console.firebase.google.com/project/test-firebase-auth-4ad79/functions/logs

3. **Vérifier le service account**
   - Doit être celui du projet Shop
   - Fichier : `functions/firebase-admin-service-account.json`

## Résumé pour un nouveau dev

"On a deux projets Firebase séparés. Quand un utilisateur se connecte, une Cloud Function génère un custom token qui permet d'accéder au deuxième projet. Tout est automatique, l'utilisateur ne voit qu'une seule connexion."