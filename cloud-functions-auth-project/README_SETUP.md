# Setup Cloud Functions

## Installation

1. **Installer les dépendances**
```bash
cd functions
npm install
```

2. **Ajouter le service account** (fourni séparément)
   - Placer `firebase-admin-service-account.json` directement dans le dossier `functions/`
   - Ce fichier vient du projet smarteen-data (ne pas le modifier)

3. **Compiler le code**
```bash
npm run build
```
   - Compile TypeScript vers JavaScript
   - Copie automatiquement le service account dans `lib/`

4. **Déployer sur le projet Auth**
```bash
cd ..  # Retour au dossier racine
firebase login
firebase use [VOTRE-PROJET-AUTH]  # ⚠️ Remplacer par votre projet d'authentification
firebase deploy --only functions
```

## Ce qui NE CHANGE PAS

- Le projet Shop reste `smarteen-data` 
- Les service accounts restent ceux de `smarteen-data`
- Les custom claims restent les mêmes

## Ce qui DOIT CHANGER

- Uniquement le projet Firebase où vous déployez les Cloud Functions
- Au lieu de `test-firebase-auth-4ad79`, utilisez le nom de du projet Auth

## Commande complète (tout en un)

```bash
cd functions && npm install && npm run build && cd .. && firebase use [VOTRE-PROJET-AUTH] && firebase deploy --only functions
```

## Résumé

La Cloud Function permet aux utilisateurs du projet Auth d'accéder au projet Shop Smarteen (smarteen-data) via des custom tokens.