# 🚀 GUIDE DE DÉPLOIEMENT - SUNGKU SUPER APP

## Table des matières
1. [En local (développement)](#en-local-développement)
2. [Backend sur le cloud](#backend-sur-le-cloud)
3. [Frontend sur le cloud](#frontend-sur-le-cloud)
4. [Mobile Android](#mobile-android)
5. [Checklist de production](#checklist-de-production)

---

## En local (développement)

### Prérequis
- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)
- Git
- Android Studio (pour mobile)

### 1. Installation

```powershell
cd "c:\Users\EMMANUEL\Downloads\super sungku app"

# Installer les dépendances
npm install

# Vérifier tout est ok
npm run build
```

### 2. Démarrage des serveurs

#### Terminal 1 - Backend API (port 4000)
```powershell
npm run backend:dev
```
✅ Accessible sur http://localhost:4000
- Health check : GET http://localhost:4000/api/health

#### Terminal 2 - Frontend Dev Server (port 5173)
```powershell
npm run dev
```
✅ Accessible sur http://localhost:5173
- Hot reload activé (modifications en temps réel)

### 3. Tester localement

#### User credentials (depuis backend)
```json
Email: demo@sungku.app
Password: demo123
```

#### Test API endpoints
```bash
# Health check
curl http://localhost:4000/api/health

# FAQ
curl http://localhost:4000/api/help/faq?lang=fr

# Contacts d'un utilisateur
curl http://localhost:4000/api/contacts/test-user
```

#### Test front
1. Ouvrir http://localhost:5173
2. S'inscrire ou se connecter
3. Tester les fonctionnalités
4. Vérifier les appels API dans DevTools (F12 → Network)

---

## Backend sur le cloud

### Option 1 : Railway.app (Recommandé - Gratuit 5$/mois)

#### 1. Créer un compte Railway
```powershell
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login
```

#### 2. Déployer le backend
```powershell
cd "c:\Users\EMMANUEL\Downloads\super sungku app"

# Initialiser Railway
railway init
# Sélectionner : Create new project → Node.js → backend environment

# Déployer
railway up
```

#### 3. Configurer les variables d'environnement
```bash
# Sur le dashboard Railway, ajouter :
PORT=4000
NODE_ENV=production
DATABASE_URL=votre-url-postgres  # optionnel, jsonl for now
```

#### 4. Récupérer l'URL du backend
```bash
railway link
# L'URL sera quelque chose comme : https://sungku-backend.railway.app
```

---

### Option 2 : Render.com (Gratuit avec limitation)

#### 1. Sign up
https://render.com

#### 2. Créer un nouveau service
- GitHub → Connecter repo
- Root directory : `.`
- Build command : `npm install`
- Start command : `npm run backend:dev`
- Environment : Node
- Plan : Free

#### 3. Récupérer l'URL
https://sungku-backend.onrender.com

---

### Option 3 : AWS EC2 (Plus complexe)

```bash
# 1. Lancer une instance Ubuntu 22.04
# Instance type : t2.micro (Free tier)

# 2. SSH dans l'instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Cloner le repo
git clone https://github.com/your-repo.git
cd super-sungku-app

# 5. Installer et démarrer
npm install
npm run backend:dev

# 6. Utiliser PM2 pour garder le service actif
sudo npm install -g pm2
pm2 start npm --name "sungku-backend" -- run backend:dev
pm2 startup
pm2 save
```

---

## Frontend sur le cloud

### Option 1 : Netlify (Recommandé - Gratuit)

#### 1. Créer un repository GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

#### 2. Connecter à Netlify
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter et déployer
netlify login
netlify init
```

#### 3. Configurer
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: optionnel

#### 4. Récupérer l'URL
https://sungku-super-app.netlify.app

#### 5. Configurer les variables d'environnement
```bash
# Sur Netlify Dashboard → Settings → Build & Deploy → Environment
VITE_API_BASE=https://sungku-backend.railway.app
```

---

### Option 2 : Vercel (Très facile - Gratuit)

#### 1. Installer Vercel CLI
```bash
npm install -g vercel
```

#### 2. Déployer
```bash
cd "c:\Users\EMMANUEL\Downloads\super sungku app"
vercel
```

#### 3. Configurer
- Framework : Vite
- Build command : `npm run build`
- Output directory : `dist`

#### 4. Ajouter variables d'environnement
```bash
vercel env add VITE_API_BASE
# Entrer : https://sungku-backend.railway.app
```

---

### Option 3 : GitHub Pages + GitHub Actions (Gratuit)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Mobile Android

### 1. Build pour Android

```powershell
cd "c:\Users\EMMANUEL\Downloads\super sungku app"

# Vérifier les dépendances Android
$env:ANDROID_HOME = "C:\Users\EMMANUEL\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"  # ou votre JDK

# Build web
npm run build

# Synchroniser avec Capacitor
npx cap sync android

# Ouvrir Android Studio
npx cap open android
```

### 2. Compiler l'APK

#### Debug APK (rapide, pour test)
```powershell
cd android
./gradlew assembleDebug
# APK : app/build/outputs/apk/debug/app-debug.apk
```

#### Release APK (pour Google Play)
```powershell
# 1. Créer une clé de signature
keytool -genkey -v -keystore sungku-release.keystore -alias sungku -keyalg RSA -keysize 2048 -validity 10000

# 2. Configurer signing en release
cd android
./gradlew assembleRelease
# APK : app/build/outputs/apk/release/app-release.apk
```

### 3. Tester sur Android

```powershell
# USB debug activé sur téléphone
adb devices  # Vérifier que le téléphone est connecté

# Depuis Android Studio :
# 1. Sélectionner le téléphone dans la dropdown
# 2. Cliquer sur le bouton Run ▶️
```

---

## Checklist de production

### Avant le déploiement

#### Frontend
- [ ] Variables d'environnement configurées (VITE_API_BASE)
- [ ] Build réussit sans erreur (`npm run build`)
- [ ] Bundle size acceptable (< 1MB gzipped)
- [ ] Tests passent (`npm run test`)
- [ ] Lighthouse score > 80
- [ ] HTTPS activé
- [ ] CSP headers configurés
- [ ] All translations complètes (FR/EN)

#### Backend
- [ ] Code reviewed
- [ ] Tests unitaires (`npm test`)
- [ ] API endpoints testés
- [ ] Rate limiting configuré
- [ ] CORS whitelist configuré pour domaines production
- [ ] Logs centralisés (Sentry/LogRocket)
- [ ] Monitoring alertes configurées
- [ ] Backups automatiques (données JSON → DB)
- [ ] Secrets stockés dans variables d'environnement

#### Mobile
- [ ] Icône app 192x192 + 512x512
- [ ] Splash screen personnalisé
- [ ] App signed avec clé production
- [ ] Permissions AndroidManifest.xml vérifiées
- [ ] Min API level ≥ 24 (Android 7.0)
- [ ] Version code incrémenté
- [ ] Build réussit sans warnings

#### Légal & Sécurité
- [ ] Terms of Service en ligne
- [ ] Privacy Policy en ligne
- [ ] RGPD compliance vérifiée
- [ ] KYC/AML compliant
- [ ] PCI-DSS pour paiements
- [ ] SSL/TLS certificats valides
- [ ] Audit de sécurité complété

#### Monitoring & Analytics
- [ ] Google Analytics (ou alternative)
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Performance monitoring (New Relic/DataDog)
- [ ] Alertes mis en place

---

## Configuration en production

### Environment variables

#### Frontend (`.env.production`)
```env
VITE_API_BASE=https://sungku-backend.railway.app
VITE_ENVIRONMENT=production
VITE_LOG_LEVEL=error
```

#### Backend (`backend/.env`)
```env
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
CORS_ORIGIN=https://sungku-super-app.netlify.app
DATABASE_URL=postgresql://user:pass@host:5432/sungku
JWT_SECRET=your-secret-key-min-32-chars
STRIPE_API_KEY=your-stripe-key
```

---

## Performance & Optimisation

### Frontend
```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-router', 'motion'],
          'ui': ['@radix-ui/react-dialog']
        }
      }
    }
  }
}
```

### Backend
```javascript
// backend/server.js - Compression & Caching
app.use(compression());
app.use(helmet());
app.set('trust proxy', 1);
```

---

## Rollback & Hotfix

### Si quelque chose ne va pas
```bash
# Netlify
vercel rollback

# Railway
railway logs --tail
railway stop  # ou déployer une ancienne version

# Android
# APK précédent via Play Console
```

---

## Support & Troubleshooting

### Erreurs courantes

#### 404 Not Found (Backend)
```
✓ Vérifier que backend est démarré
✓ Vérifier que la route existe
✓ Vérifier CORS config
✓ Vérifier l'URL correcte dans app
```

#### CORS Blocked
```bash
# Backend server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
```

#### Build Error
```bash
npm cache clean --force
rm -r node_modules package-lock.json
npm install
npm run build
```

#### APK Signature Issue
```bash
# Recréer la clé
cd android
rm locals.properties
./gradlew clean
./gradlew assembleRelease
```

---

## Escalade du support

- **Erreurs frontend** : Console DevTools (F12)
- **Erreurs backend** : Logs avec `railway logs` ou `pm2 logs`
- **Erreurs réseau** : Network tab DevTools ou `curl` pour API
- **Mobile issues** : Android Studio Logcat

---

## Ressources utiles

- **Railway** : https://railway.app/docs
- **Netlify** : https://docs.netlify.com
- **Vercel** : https://vercel.com/docs
- **Capacitor** : https://capacitorjs.com/docs
- **Android** : https://developer.android.com

---

**Version** : 1.0  
**Date** : 9 mars 2026  
**Statut** : ✅ Prêt pour production
