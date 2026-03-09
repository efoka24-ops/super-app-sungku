# 🔧 ARCHITECTURE BACK OFFICE - SUNGKU SUPER APP

## Architecture globale

```
super-sungku-app/
├── app/                    # Frontend Web + Mobile (React)
│   ├── lib/               # Architecture réorganisée ✅
│   ├── pages/
│   └── components/
│
├── backend/               # 🆕 Node.js Express API
│   ├── src/
│   │   ├── config/        # DB, env, middleware
│   │   ├── models/        # Schemas DB
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/   # Logique métier
│   │   ├── middleware/    # Auth, validation
│   │   └── utils/
│   ├── migrations/        # DB migrations
│   └── tests/
│
├── admin-dashboard/       # 🆕 Admin interface (React)
│   ├── src/
│   │   ├── features/
│   │   │   ├── miniapps/  # Gestion mini apps
│   │   │   ├── admin/     # Gestion admins
│   │   │   └── analytics/
│   │   └── lib/
│   └── package.json
│
└── docs/                  # Documentation API
```

---

## 📊 BASE DE DONNÉES - SCHEMA

### Modèles essentiels

```sql
-- Table Admins
CREATE TABLE admins (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role ENUM('super_admin', 'moderator') DEFAULT 'moderator',
  can_verify_apps BOOLEAN DEFAULT false,
  can_publish_apps BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Mini Apps (soumises)
CREATE TABLE mini_apps (
  id UUID PRIMARY KEY,
  developer_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  description TEXT,
  icon_url VARCHAR,
  version VARCHAR DEFAULT '1.0.0',
  status ENUM('draft', 'pending_review', 'approved', 'rejected', 'published') DEFAULT 'draft',
  category VARCHAR, -- 'ride', 'market', 'delivery', 'pharmacy', 'bills'
  entrypoint_url VARCHAR, -- URL de l'app
  permissions JSONB, -- ['geolocation', 'camera', 'contacts']
  rating DECIMAL(3,2),
  downloads INT DEFAULT 0,
  
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES admins(id),
  review_notes TEXT,
  
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table Reviews (audit trail)
CREATE TABLE mini_app_reviews (
  id UUID PRIMARY KEY,
  mini_app_id UUID REFERENCES mini_apps(id),
  admin_id UUID REFERENCES admins(id),
  action ENUM('submitted', 'requested_changes', 'approved', 'rejected', 'published', 'unpublished'),
  notes TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Table Permissions/Rôles
CREATE TABLE app_permissions (
  mini_app_id UUID REFERENCES mini_apps(id),
  permission VARCHAR, -- 'geolocation', 'camera', 'contacts', 'wallet_access'
  requested_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES admins(id)
);

-- Table Analytics
CREATE TABLE mini_app_analytics (
  id UUID PRIMARY KEY,
  mini_app_id UUID REFERENCES mini_apps(id),
  date DATE,
  installs INT,
  active_users INT,
  crashes INT,
  avg_rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API BACKEND ENDPOINTS

### Authentication Admin
```
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
POST   /api/admin/auth/refresh-token
GET    /api/admin/me
```

### Mini Apps Management
```
GET    /api/admin/miniapps                    # Liste toutes avec filtres
GET    /api/admin/miniapps/:id                # Détail app
POST   /api/admin/miniapps/:id/review         # Soumettre avis
POST   /api/admin/miniapps/:id/approve        # Approuver
POST   /api/admin/miniapps/:id/reject         # Rejeter
POST   /api/admin/miniapps/:id/publish        # Publier
DELETE /api/admin/miniapps/:id/unpublish      # Dépublier
GET    /api/admin/miniapps/:id/analytics      # Stats app
```

### Admin Management
```
GET    /api/admin/admins                      # Lister admins
POST   /api/admin/admins                      # Créer admin
PUT    /api/admin/admins/:id/permissions      # Modifier permissions
DELETE /api/admin/admins/:id                  # Supprimer admin
```

### Public API (Super App)
```
GET    /api/public/miniapps                   # Lister apps publiées
GET    /api/public/miniapps/:id               # Détail app
GET    /api/public/miniapps/category/:cat     # Par catégorie
POST   /api/public/miniapps/:id/install       # Tracker install
```

---

## 🎛️ ADMIN DASHBOARD - Pages

### 1. Dashboard (Home)
- 📊 Stats: Apps en review, publiées, rejets
- 📈 Graphiques: Téléchargements par app, crash trends
- 🔥 Top apps (popularité)
- 🚨 Alerts: Crashes élevés, avis négatifs

### 2. Mini Apps Management
- **Table** avec colonnes:
  - Nom + Icône
  - Développeur
  - Status (badge couleur)
  - Rating ⭐
  - Actions: Review, Approve, Reject, Publish
- **Filtres**: par statut, catégorie, date
- **Search** par nom
- **Detail view**: 
  - Info app
  - Permissions demandées
  - History de reviews
  - Metrics d'usage

### 3. Review Workflow
```
Draft → Pending Review → 
  ├─→ Approved → Published
  └─→ Rejected (avec notes)
```

### 4. Admins Control
- Lister tous les admins
- Créer nouveau (email + role)
- Gérer permissions par admin
- Activity log

---

## 🔐 Système d'Authentification

### Secure JWT Flow
```
1. Admin login → API valide creds → JWT(access + refresh)
2. Frontend stocke JWT en localStorage (ou httpOnly cookie)
3. Chaque requête: Bearer token dans Authorization header
4. API valide signature + expiration
5. Token refresh automatique via /refresh-endpoint
```

### Roles & Permissions
```
super_admin:
  - Tout (créer admins, approuver, publier)

moderator:
  - Peut review apps
  - Peut approuver (avec super_admin approval?)
  - Peut pas créer admins
```

---

## 🚀 TECH STACK RECOMMANDÉ

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js (simple) ou Fastify (rapide)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Storage**: AWS S3 ou Cloudinary (icônes/uploads)
- **Cache**: Redis (pour tokens, stats)

### Admin Dashboard
- **React** + TypeScript
- **UI**: same design system que super app (Shadcn/Tailwind)
- **State**: React Context ou Redux
- **Charts**: Recharts (déjà dépendance!)
- **Forms**: React Hook Form + Zod validation

### Deployment
- **Backend**: Railway, Fly.io, ou DigitalOcean
- **Database**: Managed PostgreSQL (Railway, AWS RDS)
- **Admin**: Vercel, Netlify

---

## 📋 CHECKLIST IMPLÉMENTATION

### Phase 1: Backend Skeleton (1-2 semaines)
- [ ] Init Node.js + Express
- [ ] Setup PostgreSQL + Prisma
- [ ] Models: Admin, MiniApp, Review
- [ ] Auth endpoints (login, JWT)
- [ ] Migrations

### Phase 2: Core API (2-3 semaines)
- [ ] CRUD mini apps
- [ ] Workflow approval/publish
- [ ] Permissions system
- [ ] Analytics tracking
- [ ] Error handling + logging

### Phase 3: Admin Dashboard (2-3 semaines)
- [ ] Login interface
- [ ] Dashboard/stats
- [ ] Mini apps listing + detail
- [ ] Review workflow UI
- [ ] Admin management

### Phase 4: Integration (1 semaine)
- [ ] Super App fetch mini apps publiées
- [ ] Display dans marketplace
- [ ] Installation tracking
- [ ] Error recovery

### Phase 5: Testing + Deployment (1 semaine)
- [ ] Unit + integration tests
- [ ] Deploy backend
- [ ] Deploy admin dashboard
- [ ] Documentation API

---

## 💡 Oui, c'est LE moment!

**Raisons:**
✅ Frontend structure solide  
✅ Architecture `lib/` en place  
✅ Mobile ready (Capacitor Android)  
✅ Design system aligné  
✅ Maintenant: gouvernance back office = ESSENTIEL

**Prochaines étapes:**
1. Setup backend repo + DB
2. Implémenter auth + models
3. Dev API endpoints
4. Build admin dashboard en parallèle
5. Intégrer à la super app

**Question pour toi:**
- Veux-tu que je commence par le **backend** (Express + DB)?
- Ou je crée d'abord la structure du projet + SQL schema?
- Préférence DB: PostgreSQL ou Firebase?

