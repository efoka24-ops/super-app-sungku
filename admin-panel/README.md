# Sungku Admin Panel

Application web d'administration pour gérer la plateforme Sungku Super App.

## 🚀 Démarrage rapide

```bash
cd admin-panel
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 📋 Identifiants de test

```
Email: admin@sungku.app
Mot de passe: admin123
```

## 🏗️ Structure du projet

```
admin-panel/
├── src/
│   ├── pages/          # Pages principales
│   ├── context/        # Contexte React (Auth)
│   ├── App.tsx         # Composant racine
│   ├── main.tsx        # Point d'entrée
│   └── index.css       # Styles globaux
├── public/             # Assets statiques
├── vite.config.ts      # Configuration Vite
├── tsconfig.json       # Configuration TypeScript
└── package.json        # Dépendances
```

## 📄 Pages disponibles

| Route | Description |
|-------|-------------|
| `/` | Page de connexion |
| `/dashboard` | Tableau de bord principal |
| `/users` | Gestion des utilisateurs |
| `/miniapps` | Gestion des mini-apps |
| `/analytics` | Analytiques et statistiques |

## 🔒 Authentification

L'application utilise JWT pour l'authentification. Les tokens sont stockés dans localStorage.

Pour créer un nouvel endpoint de login sur le backend :

```javascript
// backend/routes/admin.js
router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Valider les credentials
  // Générer JWT token
  // Retourner { token, name }
});
```

## 🌐 Variables d'environnement

Créez un fichier `.env` basé sur `.env.example` :

```
VITE_API_BASE=http://localhost:4000
VITE_ADMIN_SECRET=votre-secret-key
```

## 📦 Build production

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`.

## 🚀 Déploiement

### Sur Netlify

```bash
npm run build
# Déployer le dossier dist/
```

### Sur Railway/Render

```bash
npm run build
npm run preview
```

## 📱 Notes

- Cette application est complètement **séparée** de l'app mobile
- Elle s'execute sur le port 3000 (configurable dans vite.config.ts)
- Les données actuelles sont des mocks - à remplacer par des appels API réels
- L'authentification est requise pour accéder aux pages protégées
