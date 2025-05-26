# 🔥 Configuration Firebase pour SmarTeen

## 1. Configuration du projet Auth (test-firebase-auth-4ad79)

### Activer les méthodes d'authentification
1. Aller dans la console Firebase
2. Authentication > Sign-in method
3. Activer :
   - Email/Password
   - Anonymous (pour le mode développement)

### Déployer la Cloud Function
```bash
cd cloud-functions-auth-project/functions
npm install
firebase use test-firebase-auth-4ad79
firebase deploy --only functions:generateSmarTeenToken
```

## 2. Configuration du projet Shop (smarteen-data)

### Activer les services
1. **Authentication**
   - Activer Anonymous authentication
   - Activer Custom token authentication

2. **Firestore Database**
   - Créer la base de données
   - Choisir la région europe-west1
   - Démarrer en mode production

3. **Déployer les Security Rules**
```bash
firebase use smarteen-data
firebase deploy --only firestore:rules
```

## 3. Configuration Stripe

### Webhook endpoint
1. Dans le dashboard Stripe, ajouter un webhook endpoint :
   - URL : `https://votre-domaine.com/api/stripe/webhook`
   - Événements à écouter :
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`

## 4. Mode développement

En attendant le déploiement de la Cloud Function, le projet utilise automatiquement une authentification anonyme sur le projet Shop en mode développement.

### Pour tester :
1. Créer un compte sur la page d'inscription
2. Se connecter avec ce compte
3. Les données seront stockées dans Firestore du projet Shop

### Important :
- En production, la Cloud Function `generateSmarTeenToken` DOIT être déployée
- Les Security Rules doivent être adaptées pour accepter l'authentification anonyme en dev

## 5. Variables d'environnement

Assurez-vous que toutes les variables dans `.env.local` sont correctement remplies avec les valeurs de vos projets Firebase.