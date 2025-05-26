# 🚀 SmarTeen Shop - Architecture Dual Firebase

Site e-commerce Next.js 15 pour vendre le SmarTeen Phone avec une architecture dual-Firebase unique.

## 🏗️ Architecture

### Dual Firebase Setup

```
┌─────────────────────────┐     ┌─────────────────────────┐
│  FIREBASE AUTH PROJECT  │     │  FIREBASE SHOP PROJECT  │
│    (Projet existant)    │     │    (Nouveau projet)     │
├─────────────────────────┤     ├─────────────────────────┤
│ • Authentication        │     │ • Firestore Database    │
│ • User Management       │     │ • Cloud Storage         │
│ • Cloud Functions       │────▶│ • Security Rules        │
│   (Token Generation)    │     │ • Shop Data             │
└─────────────────────────┘     └─────────────────────────┘
```

## 🚦 Démarrage rapide

### 1. Prérequis

- Node.js 18+
- Compte Firebase avec 2 projets configurés
- Compte Stripe
- npm ou yarn

### 2. Installation

```bash
# Cloner le repo
git clone [votre-repo]
cd smarteen-project

# Installer les dépendances
npm install
```

### 3. Configuration

1. **Copier le fichier d'environnement**
```bash
cp .env.local.example .env.local
```

2. **Remplir les variables d'environnement**
- Configurations Firebase pour les 2 projets
- Clés Stripe
- URL du site

### 4. Configuration Firebase

#### Projet Auth (existant)
1. Déployer la Cloud Function dans `cloud-functions-auth-project/`
```bash
cd cloud-functions-auth-project/functions
npm install
firebase deploy --only functions
```

#### Projet Shop (nouveau)
1. Créer le projet Firebase
2. Activer Firestore
3. Déployer les Security Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Démarrage

```bash
npm run dev
```

## 📁 Structure du projet

```
smarteen-project/
├── app/                    # Next.js 15 App Router
│   ├── auth/              # Pages d'authentification
│   ├── account/           # Espace client
│   ├── api/               # API Routes
│   └── page.tsx           # Homepage
├── components/            # Composants React
├── hooks/                 # Custom hooks
├── lib/                   # Utilitaires
│   └── firebase/         # Configuration Firebase
├── stores/               # Stores Zustand
├── types/                # Types TypeScript
└── cloud-functions-auth-project/  # Functions pour projet Auth
```

## 🔐 Flux d'authentification

1. **Connexion utilisateur** sur le projet Auth principal
2. **Génération d'un custom token** via Cloud Function
3. **Authentification sur le projet Shop** avec le custom token
4. **Accès aux données** du shop avec les permissions appropriées

## 🛡️ Sécurité

- **Cookies HTTPOnly** pour le stockage des tokens
- **Security Rules strictes** avec vérification cross-project
- **Custom claims** pour identifier les utilisateurs SmarTeen
- **Pas de localStorage** pour les données sensibles

## 🚀 Déploiement

### Vercel
```bash
vercel --prod
```

### Variables d'environnement Vercel
Ajouter toutes les variables du fichier `.env.local` dans les settings Vercel.

## 📝 Points importants

1. **Dual Firebase** : 2 projets Firebase distincts communiquent via custom tokens
2. **Activation différée** : Les abonnements ne démarrent qu'à la livraison
3. **Cross-project auth** : Authentification synchronisée entre les 2 projets
4. **TypeScript strict** : Typage complet pour la maintenabilité

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e
```

## 📚 Documentation API

### Endpoints principaux

- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription  
- `POST /api/orders/create` - Création commande
- `GET /api/orders/[id]` - Détails commande

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Propriétaire - SmarTeen © 2024