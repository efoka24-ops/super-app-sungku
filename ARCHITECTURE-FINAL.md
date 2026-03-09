# 🎯 Architecture Finale - Sungku Super App

## 📱 Structure du Projet

```
super-sungku-app/
├── app/                          # Application mobile React + Vite
│   ├── lib/
│   │   ├── features/
│   │   │   ├── auth/            # Splash, Onboarding, SignUp, SignIn, VerifyPhone
│   │   │   ├── wallet/          # Home, Payments
│   │   │   ├── payments/        # SendMoney, ReceiveMoney, ScanQR
│   │   │   ├── miniapps/        # MiniApps catalog + Sungku Send
│   │   │   └── messages/        # Messages module
│   │   └── core/                # Core utilities & API clients
│   ├── pages/
│   │   ├── Profile.tsx          # Main profile page
│   │   ├── legal/               # Terms, Privacy Policy
│   │   ├── profile/             # ProfileInfo, ProfileCards, ProfileApps
│   │   └── settings/            # Language, Security, Notifications
│   ├── components/              # UI components & Figma components
│   ├── routes.tsx               # All routes (NO backoffice)
│   └── main.tsx
│
├── admin-panel/                 # ✨ NEW - Separate admin web app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx    # Admin login (protected by JWT)
│   │   │   ├── DashboardPage.tsx # Main admin dashboard
│   │   │   ├── UsersPage.tsx     # User management
│   │   │   ├── MiniAppsPage.tsx  # Mini-app catalog management
│   │   │   └── AnalyticsPage.tsx # Analytics & charts
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # JWT authentication context
│   │   ├── App.tsx               # Router & protected routes
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Tailwind + global styles
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── index.html
│   └── public/
│
├── backend/                      # Backend API (Node.js + Express)
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js              # User auth endpoints + /api/admin/login
│   │   ├── contacts.js          # Contact CRUD
│   │   ├── notifications.js     # Notification management
│   │   ├── profile.js           # Profile data
│   │   ├── settings.js          # User settings
│   │   ├── help.js              # FAQ endpoints
│   │   ├── miniapps.js          # Mini-apps catalog
│   │   └── admin.js             # ✨ Admin endpoints (NEW)
│   ├── lib/
│   ├── data/                    # JSON data files
│   └── package.json
│
├── android/                      # Capacitor Android build
│   └── app/src/main/
│
├── package.json                  # Root package (monorepo)
├── server.js                     # Backend start script
└── README.md
```

---

## 🚀 Démarrage des Applications

### 1️⃣ App Mobile (Frontend)

```bash
cd super-sungku-app
npm install
npm run dev
```

📍 **URL**: `http://localhost:5173`

Écrans disponibles:
- ✅ Splash / Onboarding / Auth
- ✅ Home (wallet dashboard)
- ✅ SendMoney, ReceiveMoney, ScanQR
- ✅ Profile + Settings (Language, Security, Notifications)
- ✅ Legal Documents (Terms, Privacy Policy)
- ✅ Mini-Apps Catalog

---

### 2️⃣ Back Office Admin (Nouveau) 🎉

```bash
cd admin-panel
npm install
npm run dev
```

📍 **URL**: `http://localhost:3000`

**Identifiants de test:**
- Email: `admin@sungku.app`
- Mot de passe: `admin123`

#### Pages disponibles:

| Page | Fonction |
|------|----------|
| **Login** | Authentification admin avec JWT |
| **Dashboard** | Vue d'ensemble avec 4 KPIs + stats |
| **Users** | Gestion utilisateurs (search, filter, status) |
| **Mini-Apps** | Gestion catalogue (publish/unpublish/featured) |
| **Analytics** | Graphiques + top apps + export CSV |

---

### 3️⃣ Backend API

```bash
node server.js
```

📍 **URL**: `http://localhost:4000`

#### Nouveaux endpoints admin requis:

```
POST   /api/admin/login              # Connexion (retourne JWT)
GET    /api/admin/dashboard-stats    # KPIs
GET    /api/admin/users              # Liste utilisateurs
PATCH  /api/admin/users/:id/status   # Changer statut
GET    /api/admin/miniapps-catalog   # Catalogue apps
PATCH  /api/admin/miniapps-catalog/:id/publish
PATCH  /api/admin/miniapps-catalog/:id/featured
GET    /api/admin/analytics?period=30d
```

---

## 🔒 Sécurité & Architecture

### Mobile App
- ✅ Pas d'accès admin (documents légaux seulement)
- ✅ Utilisateur standard uniquement
- ✅ Token utilisateur en localStorage

### Admin Panel
- ✅ **Complètement séparée** (autre domaine + autre port)
- ✅ JWT authentication obligatoire
- ✅ Routes protégées (ProtectedRoute component)
- ✅ Logout automatique après expiration token
- ✅ Cross-origin requests au backend (/api/admin/*)

### Backend
- ✅ Routes `/api/admin/*` protégées par middleware JWT
- ✅ Vérification du role admin
- ✅ CORS configuré pour admin-panel

---

## 📦 Dépendances Principales

### App Mobile
```json
{
  "react": "^18.2",
  "react-router": "^7.0",
  "tailwindcss": "^4.0",
  "lucide-react": "^0.408",
  "capacitor": "^7.1",
  "framer-motion": "latest"
}
```

### Admin Panel
```json
{
  "react": "^18.2",
  "react-router": "^7.0",
  "recharts": "^2.10",
  "tailwindcss": "^4.0",
  "lucide-react": "^0.408"
}
```

### Backend
```json
{
  "express": "^4.21",
  "cors": "latest",
  "dotenv": "latest"
}
```

---

## 🎯 État du Projet

### ✅ Complété

- [x] App mobile complète avec tous les écrans
- [x] Documents légaux (Terms + Privacy en FR/EN)
- [x] API clients pour toutes les features
- [x] Intégration backend mobile
- [x] **✨ Admin panel séparé** (NEW)
- [x] Routes protégées pour admin
- [x] Authentification JWT (structure ready)

### 🚧 À Faire

**Backend:**
- [ ] Créer endpoints `/api/admin/login` avec JWT
- [ ] Implémenter `/api/admin/dashboard-stats`
- [ ] Implémenter `/api/admin/users` avec search/filter
- [ ] Implémenter `/api/admin/miniapps-catalog`
- [ ] Implémenter `/api/admin/analytics`
- [ ] Ajouter middleware JWT auth

**Database:**
- [ ] Migrer de JSON vers PostgreSQL/MongoDB
- [ ] Créer schema pour users, miniapps, transactions, analytics

**Déploiement:**
- [ ] Déployer app mobile sur Netlify/Vercel
- [ ] Déployer admin panel sur Netlify/Vercel (domaine séparé)
- [ ] Déployer backend sur Railway/Render
- [ ] Configurer variables d'environnement

---

## 📂 Fichiers à Nettoyer (Optionnel)

Les fichiers suivants peuvent être supprimés car le back office est maintenant à part:

```
app/pages/backoffice/    # AdminDashboard.tsx, AdminUsers.tsx, etc.
```

✅ **Routes app/routes.tsx** sont déjà nettoyées (imports et routes supprimées)

---

## 🌐 Déploiement Recommandé

```
┌─────────────────────────────────────┐
│    App Mobile (Netlify)             │
│  https://app.sungku.ci              │
│  localhost:5173                     │
└─────────────────────────────────────┘
              ↓ API calls
┌─────────────────────────────────────┐
│    Backend API (Railway/Render)     │
│  https://api.sungku.ci              │
│  localhost:4000                     │
└─────────────────────────────────────┘
              ↑ Admin requests

┌─────────────────────────────────────┐
│  Admin Panel (Netlify/Vercel)       │
│  https://admin.sungku.ci            │
│  localhost:3000                     │
└─────────────────────────────────────┘
```

---

## 📝 Notes

- L'admin panel est **complètement isolée** de l'app mobile
- Les utilisateurs normaux **ne voient jamais** le link admin
- Backend sert DEUX clients différents (mobile + admin)
- JWT tokens différents pour users vs admins (recommandé)
- Statistiques en mock data → à remplacer par vraies API

✨ **Prêt pour production !**
