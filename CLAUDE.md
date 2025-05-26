# SmarTeen Project - Guide pour Claude

## 🎯 Contexte du projet

Site e-commerce Next.js 15 pour vendre le SmarTeen Phone (smartphone sécurisé pour enfants 8-14 ans) avec une architecture dual-Firebase unique :
- **Firebase Auth Project** : Projet existant pour l'authentification
- **Firebase Shop Project** : Nouveau projet pour les données du shop

## 🔑 Points critiques à retenir

### Architecture Dual-Firebase
- **2 projets Firebase distincts** qui communiquent via custom tokens
- L'authentification se fait d'abord sur le projet Auth, puis un custom token est généré pour s'authentifier sur le projet Shop
- Les Security Rules vérifient les custom claims `smarteenAccess` et `fromMobileApp`

### Activation différée des abonnements
- L'abonnement Stripe est créé en mode PAUSÉ lors du paiement
- Il n'est activé QUE lors de la livraison du téléphone
- Webhook Stripe pour gérer l'activation

### Commandes importantes
```bash
# Développement
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check
```

## 📁 Structure clé

```
/app              # Pages Next.js 15 (App Router)
/components       # Composants React
/lib             
  /firebase      # Config et helpers Firebase
  /stripe        # Config et helpers Stripe
/stores          # Stores Zustand
/types           # Types TypeScript
```

## 🔐 Variables d'environnement essentielles

- `NEXT_PUBLIC_FIREBASE_*_AUTH` : Config Firebase projet Auth
- `NEXT_PUBLIC_FIREBASE_*_SHOP` : Config Firebase projet Shop  
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` : Clé publique Stripe
- `STRIPE_SECRET_KEY` : Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` : Secret webhook Stripe

## 🚨 Sécurité

- **Cookies HTTPOnly** uniquement (pas de localStorage)
- **Cross-project authentication** avec custom tokens
- **Security Rules strictes** dans Firestore

## 📋 TODO prioritaires

1. Déployer la Cloud Function dans le projet Auth existant
2. Configurer les variables d'environnement
3. Créer le projet Firebase Shop et déployer les Security Rules
4. Configurer Stripe et le webhook
5. Tester le flow complet de commande