# 🚀 GUIDE DÉPLOIEMENT BACK4APP - Backend API

## ✅ État actuel

- ✓ Backend Express configuré (`backend/server.js`)
- ✓ Dockerfile prêt pour containerisation
- ✓ Procfile pour Back4App
- ✓ Code poussé sur GitHub: `https://github.com/efoka24-ops/super-app-sungku`

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### 1️⃣ Créer un compte Back4App (Gratuit)

1. Visite: https://www.back4app.com/
2. Clique sur **"Sign up"**
3. Crée ton compte avec email/password
4. Vérifie ton email

### 2️⃣ Création d'une nouvelle App Back4App

1. Dashboard → **"Create new app"**
2. Nomme l'app: `sungku-backend-api`
3. Sélectionne la région: **Europe (Frankfurt)** (plus proche de l'Afrique)
4. Clique **"Create"**

### 3️⃣ Connecter GitHub (Auto-Deploy)

1. Dans Back4App Dashboard, va à **Settings** → **Deploy**
2. Clique sur **"Connect GitHub"**
3. Autorise Back4App à accéder à ton repo
4. Sélectionne: `efoka24-ops/super-app-sungku`
5. Branche: `main`
6. Clique **"Deploy"**

→ **Back4App va auto-déployer** à chaque push sur GitHub! 🎉

### 4️⃣ Configurer les Variables d'Environnement

1. Back4App Dashboard → **Settings** → **Environment Variables**
2. Ajoute ces variables:

```
NODE_ENV = production
PORT = 8080
```

3. Clique **"Save"**

### 5️⃣ Vérifier le Déploiement

Une fois le deploy terminé:

```
✅ URL du backend: https://sungku-backend-api.b4a.app
                   (ou https://ton-app-name.herokuapp.com)
```

Test rapide dans ton navigateur:
```
https://sungku-backend-api.b4a.app/api/health
```

Devrait retourner:
```json
{"status": "ok", "timestamp": "2026-03-09..."}
```

---

## 🔄 METTRE À JOUR L'APP MOBILE

### Dans ton app React

Remplace l'URL du backend:

#### Fichier: `app/lib/core/index.ts` ou ton API config

```typescript
// ❌ AVANT (développement)
const API_URL = 'http://localhost:4000'

// ✅ APRÈS (production Back4App)
const API_URL = 'https://sungku-backend-api.b4a.app'
```

#### Ou crée un fichier `.env`:

```env
VITE_API_URL=https://sungku-backend-api.b4a.app
```

Puis utilise:
```typescript
const API_URL = import.meta.env.VITE_API_URL
```

---

## 🧪 TESTER LES ENDPOINTS

Tu peux tester avec `curl` ou Postman:

```bash
# Login
curl -X POST https://sungku-backend-api.b4a.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "687654321", "password": "1234"}'

# Get users
curl https://sungku-backend-api.b4a.app/api/admin/users

# Get messages
curl https://sungku-backend-api.b4a.app/api/messages/user-id-here
```

---

## 📱 BUILD & REDEPLOY

### Après modification du backend:

```powershell
# 1. Commit et push
cd "c:\Users\EMMANUEL\Downloads\super sungku app"
git add .
git commit -m "Fix/Feature description"
git push origin main

# 2. Back4App redéploie automatiquement (~30s)
# Vérifie les logs dans Back4App Dashboard → Logs
```

### Auto-Deploy Workflow:
```
Local commit → GitHub push → Back4App détecte → Auto-build → Auto-deploy ✅
```

---

## 🐛 DÉBOGUER

### Voir les logs en temps réel:

1. Back4App Dashboard
2. **Logs** (en bas)
3. Filtre par type: Error, Warn, Info
4. Tail les logs live

### Commandes CLI Back4App (optional):

```powershell
# Installer CLI
npm install -g back4app-cli

# Login
back4app login

# Voir les logs
back4app logs

# Deploy manuel
back4app deploy
```

---

## 💰 COÛTS

**Back4App - Tier Gratuit:**
- ✅ 1 app gratuite
- ✅ 1 GB stockage
- ✅ 500 MB bande passante/jour
- ✅ HTTPS inclus
- ✅ Auto-scaling

Si tu dépassses → Plan payant ~$10/mois

---

## 🔑 ENDPOINTS DISPONIBLES

Tous tes endpoints sont accessibles:

| Route | URL |
|-------|-----|
| **Health Check** | `https://sungku-backend-api.b4a.app/api/health` |
| **Auth Login** | `POST /api/auth/login` |
| **Admin Users** | `GET /api/admin/users` |
| **Profile** | `GET /api/profile/{userId}` |
| **Messages** | `GET /api/messages/{userId}` |
| **Transactions** | `GET /api/profile/{userId}/stats` |
| **Mini Apps** | `GET /api/miniapps` |

---

## 🚨 PROBLÈMES COURANTS

### ❌ "Build failed"
→ Vérifier les logs Back4App
→ Vérifier que `backend/server.js` existe
→ Vérifier les dépendances dans `package.json`

### ❌ "Port 8080 already in use"
→ Back4App gère automatiquement le port
→ Ne pas fixer le port à une valeur fixe, utiliser `process.env.PORT`

### ❌ "Connexion timeout"
→ Vérifier que l'URL est correcte
→ Vérifier CORS dans Express (déjà configuré ✅)
→ Attendre 5 min après le deploy

---

## ✅ CHECKLIST

- [ ] Compte Back4App créé
- [ ] App Back4App créée
- [ ] GitHub connecté à Back4App
- [ ] Deploy réussi (check logs)
- [ ] Endpoint `/api/health` répond
- [ ] URL mise à jour dans l'app mobile
- [ ] App Web testée avec new backend
- [ ] App mobile testée sur Android
- [ ] Auto-deploy fonctionne (test avec push)

---

## 📞 SUPPORT

- **Back4App Docs:** https://www.back4app.com/docs/guides
- **Express.js:** https://expressjs.com/
- **GitHub Actions:** https://github.com/features/actions

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Deploy backend sur Back4App
2. ✅ Mettre à jour URLs dans app mobile
3. ⏭️ Tester l'app mobile en production
4. ⏭️ Ajouter Firestore pour persistance data (optional)
5. ⏭️ Implémenter authentification robuste
6. ⏭️ Tests de charge/stress test

---

Bonne chance! 🚀
