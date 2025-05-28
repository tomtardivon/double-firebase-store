# 🔐 createCustomToken - Explication Détaillée

## Qu'est-ce qu'un Custom Token ?

Un custom token est un **jeton JWT** (JSON Web Token) qui contient :

### 1. Structure du Token

```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJVU0VSMTIzIiwic21hcnRlZW5BY2Nlc3MiOnRydWUsImZyb21Nb2JpbGVBcHAiOnRydWUsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTcwNDIwMDAwMCwiZXhwIjoxNzA0MjAzNjAwLCJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlzcyI6ImZpcmViYXNlLWFkbWluc2RrLWFiY2RlQHNtYXJ0ZWVuLWF1dGguaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJmaXJlYmFzZS1hZG1pbnNkay1hYmNkZUBzbWFydGVlbi1hdXRoLmlhbS5nc2VydmljZWFjY291bnQuY29tIn0.signature_here
```

Ce token se décompose en 3 parties séparées par des points :
1. **Header** : Type de token et algorithme
2. **Payload** : Données et claims
3. **Signature** : Vérification de l'authenticité

### 2. Contenu décodé

```json
{
  // Header
  "alg": "RS256",
  "typ": "JWT"
}

{
  // Payload
  "uid": "USER123",
  "smarteenAccess": true,
  "fromMobileApp": true,
  "email": "john@example.com",
  "iat": 1704200000,  // Issued at (timestamp)
  "exp": 1704203600,  // Expiration (1h après)
  "aud": "https://identitytoolkit.googleapis.com/...",
  "iss": "firebase-adminsdk-abcde@smarteen-auth.iam.gserviceaccount.com",
  "sub": "firebase-adminsdk-abcde@smarteen-auth.iam.gserviceaccount.com"
}
```

## 🎯 Pourquoi utiliser createCustomToken ?

### 1. **Authentification Cross-Project**
Permet à un utilisateur authentifié dans un projet Firebase de s'authentifier dans un autre projet.

### 2. **Claims personnalisés**
Ajouter des informations supplémentaires qui seront vérifiées par les Security Rules.

### 3. **Intégration avec des systèmes externes**
Authentifier des utilisateurs venant d'autres systèmes d'authentification.

## 💻 Utilisation dans votre code

### Côté serveur (Cloud Function)

```javascript
// Dans votre Cloud Function
const customToken = await shopApp.auth().createCustomToken(uid, {
  smarteenAccess: true,      // Claim personnalisé
  fromMobileApp: true,       // Claim personnalisé
  email: user.email,         // Info additionnelle
  uid: uid                   // UID de l'utilisateur
});
```

### Côté client (Application)

```javascript
// Utilisation du token pour se connecter
await signInWithCustomToken(auth, customToken);
```

## 🔒 Sécurité

### Ce que createCustomToken fait :
1. **Génère** un token JWT signé avec la clé privée du service account
2. **Inclut** l'UID de l'utilisateur et les claims personnalisés
3. **Expire** automatiquement après 1 heure
4. **Garantit** l'authenticité via la signature cryptographique

### Ce que createCustomToken NE fait PAS :
1. **Ne crée PAS** d'utilisateur dans Firebase Auth
2. **Ne vérifie PAS** si l'utilisateur existe
3. **Ne stocke PAS** le token quelque part
4. **Ne modifie PAS** l'utilisateur existant

## 🔄 Flux complet dans SmarTeen

```mermaid
graph TD
    A[User login Auth Project] -->|1. Email/Password| B[Firebase Auth]
    B -->|2. User authenticated| C[Cloud Function]
    C -->|3. createCustomToken| D[Custom Token avec claims]
    D -->|4. Return to client| E[Client App]
    E -->|5. signInWithCustomToken| F[Firebase Shop]
    F -->|6. Token validé| G[Accès autorisé]
    
    style C fill:#f9f,stroke:#333,stroke-width:4px
    style D fill:#bbf,stroke:#333,stroke-width:2px
```

## 📝 Exemple concret

### 1. Appel de la Cloud Function
```javascript
// Client demande un token
const result = await generateSmarTeenToken({ uid: "USER123" });
```

### 2. Cloud Function génère le token
```javascript
const customToken = await shopApp.auth().createCustomToken("USER123", {
  smarteenAccess: true,
  fromMobileApp: true,
  email: "user@example.com"
});
// Retourne: "eyJhbGciOiJSUzI1NiIs..."
```

### 3. Client utilise le token
```javascript
await signInWithCustomToken(shopAuth, "eyJhbGciOiJSUzI1NiIs...");
```

### 4. Security Rules vérifient
```javascript
// Dans Firestore Rules
request.auth.token.smarteenAccess == true  // ✅ Vérifié
request.auth.token.fromMobileApp == true   // ✅ Vérifié
```

## ⚠️ Limitations

1. **Durée de vie** : 1 heure maximum
2. **Taille des claims** : Maximum 1000 caractères
3. **Noms réservés** : Certains noms de claims sont réservés par Firebase
4. **Signature** : Nécessite un service account avec les bonnes permissions

## 🛡️ Bonnes pratiques

### ✅ À FAIRE :
- Inclure uniquement les claims nécessaires
- Valider l'utilisateur avant de créer le token
- Logger la création pour l'audit
- Gérer les erreurs proprement

### ❌ À ÉVITER :
- Mettre des données sensibles dans les claims
- Créer des tokens avec une durée de vie trop longue
- Exposer le service account publiquement
- Créer des tokens sans vérification

## 🔍 Debug

Pour décoder et inspecter un token :
1. Aller sur [jwt.io](https://jwt.io)
2. Coller le token
3. Voir le contenu décodé

⚠️ **Note** : Ne jamais partager un token valide publiquement !