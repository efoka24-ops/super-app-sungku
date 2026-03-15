import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads", "miniapps");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 }
});

function readUsersStore() {
  const usersData = readCollection("users.json", {});
  return Array.isArray(usersData) ? usersData : Object.values(usersData);
}

function writeUsersStore(users) {
  const usersById = users.reduce((acc, user) => {
    if (user?.userId) {
      acc[user.userId] = user;
    }
    return acc;
  }, {});
  writeCollection("users.json", usersById);
}

function readMiniAppsCatalog() {
  return readCollection("miniapps-catalog.json", []);
}

function writeMiniAppsCatalog(catalog) {
  writeCollection("miniapps-catalog.json", catalog);
}

function readFaqStore() {
  return readCollection("faq.json", { fr: [], en: [] });
}

function writeFaqStore(faq) {
  writeCollection("faq.json", faq);
}

function readNotificationsStore() {
  return readCollection("notifications.json", {});
}

function writeNotificationsStore(data) {
  writeCollection("notifications.json", data);
}

function readMessagesStore() {
  return readCollection("messages.json", {});
}

function mapSupabaseUser(row) {
  return {
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    verified: row.verified,
    language: row.language,
    avatar: row.avatar,
    createdAt: row.created_at,
    status: row.status || "active",
    kycLevel: row.kyc_level || "none",
    balance: Number(row.balance) || 0
  };
}

function buildPeriodSeries(period, usersList, transactionsList) {
  const now = new Date();

  if (period === "7d") {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const users = usersList.filter((user) => (user.createdAt || "").slice(0, 10) === key).length;
      const dailyTransactions = transactionsList.filter((tx) => (tx.completedAt || tx.createdAt || "").slice(0, 10) === key);
      return {
        label: date.toLocaleDateString("fr-FR", { weekday: "short" }),
        users,
        transactions: dailyTransactions.length,
        revenue: dailyTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
      };
    });
  }

  const monthCount = period === "1y" ? 12 : period === "90d" ? 3 : 6;
  return Array.from({ length: monthCount }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthUsers = usersList.filter((user) => {
      const createdAt = user.createdAt ? new Date(user.createdAt) : null;
      return createdAt && createdAt.getMonth() === month && createdAt.getFullYear() === year;
    });
    const monthTransactions = transactionsList.filter((tx) => {
      const completedAt = tx.completedAt || tx.createdAt;
      const txDate = completedAt ? new Date(completedAt) : null;
      return txDate && txDate.getMonth() === month && txDate.getFullYear() === year;
    });

    return {
      label: date.toLocaleDateString("fr-FR", { month: "short" }),
      users: monthUsers.length,
      transactions: monthTransactions.length,
      revenue: monthTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
    };
  });
}

// Simple JWT-like token generation (in production, use real JWT package)
function generateToken(adminId) {
  const payload = {
    adminId,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  // For demo: simple base64 encoding (NOT secure, use jsonwebtoken in production)
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Admin login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Test credentials (in production, hash passwords and query database)
  const testAdmins = {
    "admin@sungku.app": "admin123",
    "support@sungku.app": "support123"
  };

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email et mot de passe requis"
    });
  }

  if (testAdmins[email] !== password) {
    return res.status(401).json({
      success: false,
      message: "Email ou mot de passe incorrect"
    });
  }

  const token = generateToken(email);
  
  // Store login session
  const sessions = readCollection("admin-sessions.json", {});
  sessions[token] = {
    email,
    loginAt: nowIso(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  writeCollection("admin-sessions.json", sessions);

  res.json({
    success: true,
    message: "Authentification réussie",
    token,
    admin: {
      email,
      name: email.split("@")[0]
    }
  });
});

// Get dashboard stats (REAL DATA)
router.get("/dashboard-stats", async (req, res) => {
  let usersList = [];
  if (db) {
    const { data: rows } = await db.from("users").select("user_id,first_name,last_name,verified,created_at");
    if (rows) usersList = rows.map(r => ({ userId: r.user_id, firstName: r.first_name, lastName: r.last_name, verified: r.verified, createdAt: r.created_at }));
  }
  if (!usersList.length) {
    usersList = readUsersStore();
  }

  let transactionsList = [];
  if (db) {
    const { data: rows } = await db.from("ussd_transactions").select("*");
    if (rows) transactionsList = rows.map(r => ({ status: r.status, amount: r.amount, completedAt: r.completed_at }));
  }
  if (!transactionsList.length) {
    transactionsList = Object.values(readCollection("ussd-transactions.json", {}));
  }

  const totalUsers          = usersList.length;
  const activeUsers         = usersList.filter(u => u.verified).length;
  const totalTransactions   = transactionsList.length;
  const completedTransactions = transactionsList.filter(t => t.status === "completed");
  const totalRevenue        = completedTransactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const miniApps            = readMiniAppsCatalog();

  const recentActivity = usersList
    .filter(u => u.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map(u => ({ id: `user-${u.userId}`, user: `${u.firstName || u.first_name || ""} ${u.lastName || u.last_name || ""}`.trim() || u.userId, action: "Inscription", timestamp: u.createdAt }));

  res.json({ success: true, totalUsers, activeUsers, totalTransactions, totalRevenue, miniAppsCount: miniApps.length, recentActivity });
});

// Get users with search/filter
router.get("/users", async (req, res) => {
  const { search, status, limit = 100, offset = 0 } = req.query;
  let allUsers = [];

  if (db) {
    const { data } = await db.from("users").select("*").order("created_at", { ascending: false });
    if (data) allUsers = data.map(mapSupabaseUser);
  }
  if (!allUsers.length) {
    allUsers = readUsersStore().map((user) => ({
      ...user,
      status: user.status || "active",
      kycLevel: user.kycLevel || "none",
      balance: Number(user.balance) || 0
    }));
  }

  let filtered = allUsers;
  if (search) {
    const s = search.toLowerCase();
    filtered = allUsers.filter(u => (u.firstName?.toLowerCase()||'').includes(s) || (u.lastName?.toLowerCase()||'').includes(s) || (u.email?.toLowerCase()||'').includes(s) || (u.phone||'').includes(search));
  }
  if (status && status !== "all") filtered = filtered.filter(u => u.status === status);

  res.json({ success: true, users: filtered.slice(Number(offset), Number(offset)+Number(limit)), total: filtered.length, limit: Number(limit), offset: Number(offset) });
});

// Update user status
router.patch("/users/:userId/status", (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!["active", "suspended", "blocked"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Statut invalide"
    });
  }

  const users = readUsersStore();
  const user = users.find((entry) => entry.userId === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Utilisateur non trouvé"
    });
  }

  user.status = status;
  user.updatedAt = nowIso();
  writeUsersStore(users);

  res.json({
    success: true,
    message: `Utilisateur ${status}`,
    user
  });
});

router.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  if (db) {
    const { data: row } = await db.from("users").select("*").eq("user_id", userId).maybeSingle();
    if (row) {
      const mapped = mapSupabaseUser(row);
      return res.json({ success: true, user: mapped });
    }
  }

  const users = readUsersStore();
  const user = users.find((entry) => entry.userId === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
  }

  return res.json({
    success: true,
    user: {
      ...user,
      status: user.status || "active",
      kycLevel: user.kycLevel || "none",
      balance: Number(user.balance) || 0
    }
  });
});

router.patch("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, phone, status, kycLevel, balance, verified } = req.body || {};

  if (db) {
    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      status,
      kyc_level: kycLevel,
      balance: Number(balance),
      verified
    };
    const cleanPayload = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    if (Object.keys(cleanPayload).length > 0) {
      const { error } = await db.from("users").update(cleanPayload).eq("user_id", userId);
      if (error) {
        return res.status(500).json({ success: false, message: "Mise à jour Supabase impossible" });
      }
      const { data: updated } = await db.from("users").select("*").eq("user_id", userId).maybeSingle();
      return res.json({ success: true, message: "Utilisateur mis à jour", user: updated ? mapSupabaseUser(updated) : null });
    }
  }

  const users = readUsersStore();
  const user = users.find((entry) => entry.userId === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
  }

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (status !== undefined) user.status = status;
  if (kycLevel !== undefined) user.kycLevel = kycLevel;
  if (balance !== undefined) user.balance = Number(balance) || 0;
  if (verified !== undefined) user.verified = Boolean(verified);
  user.updatedAt = nowIso();
  writeUsersStore(users);

  return res.json({ success: true, message: "Utilisateur mis à jour", user });
});

router.post("/miniapps/upload", upload.single("apk"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Fichier APK requis" });
  }

  return res.status(201).json({
    success: true,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: `/uploads/miniapps/${req.file.filename}`
  });
});

router.post("/miniapps", (req, res) => {
  const { name, category, description = "", fileName = "", fileSize = 0, published = true, featured = false, fileUrl = "" } = req.body;

  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: "Nom et catégorie requis"
    });
  }

  const catalog = readMiniAppsCatalog();
  const miniApp = {
    id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    name,
    category,
    description,
    published,
    featured,
    installations: 0,
    rating: 0,
    uploadedAt: nowIso().slice(0, 10),
    fileName,
    fileSize,
    fileUrl
  };

  catalog.unshift(miniApp);
  writeMiniAppsCatalog(catalog);

  res.status(201).json({
    success: true,
    message: "Mini-app ajoutée",
    miniApp
  });
});

router.get("/notifications", (req, res) => {
  const { userId } = req.query;
  const store = readNotificationsStore();
  if (userId) {
    return res.json({ success: true, notifications: store[userId] || [] });
  }

  const flat = Object.entries(store).flatMap(([uid, notifications]) =>
    (notifications || []).map((notification) => ({ ...notification, userId: uid }))
  );
  return res.json({ success: true, notifications: flat.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) });
});

router.post("/notifications", (req, res) => {
  const { userId, title, message, type = "system", target = "single" } = req.body || {};
  if (!title || !message) {
    return res.status(400).json({ success: false, message: "Titre et message requis" });
  }

  const users = readUsersStore();
  const recipientIds = target === "all" ? users.map((user) => user.userId) : [userId];
  if (!recipientIds[0]) {
    return res.status(400).json({ success: false, message: "userId requis" });
  }

  const store = readNotificationsStore();
  recipientIds.forEach((recipientId) => {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title,
      message,
      type,
      read: false,
      createdAt: nowIso()
    };
    store[recipientId] = [notification, ...(store[recipientId] || [])];
  });
  writeNotificationsStore(store);

  return res.status(201).json({ success: true, message: "Notification envoyée", recipients: recipientIds.length });
});

router.get("/messages/conversations", (req, res) => {
  const { userId } = req.query;
  const store = readMessagesStore();

  if (userId) {
    const conversations = store[userId]?.conversations || [];
    return res.json({ success: true, conversations });
  }

  const summary = Object.entries(store).map(([uid, payload]) => ({
    userId: uid,
    conversations: (payload?.conversations || []).length,
    unread: (payload?.conversations || []).reduce((sum, item) => sum + (Number(item.unread) || 0), 0)
  }));

  return res.json({ success: true, users: summary });
});

router.get("/faq", (req, res) => {
  const lang = req.query.lang === "en" ? "en" : req.query.lang === "fr" ? "fr" : null;
  const faq = readFaqStore();
  if (!lang) {
    return res.json({ success: true, faq });
  }
  return res.json({ success: true, lang, items: faq[lang] || [] });
});

router.post("/faq", (req, res) => {
  const { lang = "fr", question, answer } = req.body || {};
  if (!question || !answer) {
    return res.status(400).json({ success: false, message: "Question et réponse requises" });
  }
  const faq = readFaqStore();
  const safeLang = lang === "en" ? "en" : "fr";
  const item = {
    id: `faq_${Date.now()}`,
    question,
    answer
  };
  faq[safeLang] = [item, ...(faq[safeLang] || [])];
  writeFaqStore(faq);
  return res.status(201).json({ success: true, item });
});

router.put("/faq/:itemId", (req, res) => {
  const { itemId } = req.params;
  const { lang = "fr", question, answer } = req.body || {};
  const safeLang = lang === "en" ? "en" : "fr";
  const faq = readFaqStore();
  const idx = (faq[safeLang] || []).findIndex((item) => item.id === itemId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "FAQ introuvable" });
  }
  faq[safeLang][idx] = {
    ...faq[safeLang][idx],
    question: question ?? faq[safeLang][idx].question,
    answer: answer ?? faq[safeLang][idx].answer
  };
  writeFaqStore(faq);
  return res.json({ success: true, item: faq[safeLang][idx] });
});

router.delete("/faq/:itemId", (req, res) => {
  const { itemId } = req.params;
  const lang = req.query.lang === "en" ? "en" : "fr";
  const faq = readFaqStore();
  const before = faq[lang] || [];
  faq[lang] = before.filter((item) => item.id !== itemId);
  if (faq[lang].length === before.length) {
    return res.status(404).json({ success: false, message: "FAQ introuvable" });
  }
  writeFaqStore(faq);
  return res.json({ success: true, message: "FAQ supprimée" });
});

// Get mini-apps catalog
router.get("/miniapps-catalog", (req, res) => {
  const catalog = readCollection("miniapps-catalog.json", [
    {
      id: "livraison",
      name: "Livraison Express",
      category: "logistics",
      published: true,
      featured: false,
      installations: 12450,
      rating: 4.5
    },
    {
      id: "pharmacie",
      name: "Pharmacie Online",
      category: "health",
      published: true,
      featured: true,
      installations: 8920,
      rating: 4.7
    },
    {
      id: "location",
      name: "Location Voiture",
      category: "transport",
      published: false,
      featured: false,
      installations: 3200,
      rating: 4.2
    }
  ]);

  res.json({
    success: true,
    miniApps: catalog
  });
});

// Update mini-app publish status
router.patch("/miniapps/:appId/publish", (req, res) => {
  const { appId } = req.params;
  const { published } = req.body;

  const catalog = readMiniAppsCatalog();
  const app = catalog.find(a => a.id === appId);

  if (!app) {
    return res.status(404).json({
      success: false,
      message: "Mini-app non trouvée"
    });
  }

  app.published = published;
  writeMiniAppsCatalog(catalog);

  res.json({
    success: true,
    message: published ? "Mini-app publiée" : "Mini-app dépubliée",
    miniApp: app
  });
});

// Update mini-app featured status
router.patch("/miniapps/:appId/featured", (req, res) => {
  const { appId } = req.params;
  const { featured } = req.body;

  const catalog = readMiniAppsCatalog();
  const app = catalog.find(a => a.id === appId);

  if (!app) {
    return res.status(404).json({
      success: false,
      message: "Mini-app non trouvée"
    });
  }

  app.featured = featured;
  writeMiniAppsCatalog(catalog);

  res.json({
    success: true,
    message: featured ? "Mini-app en vedette" : "Mini-app retirée de la vedette",
    miniApp: app
  });
});

// Delete mini-app
router.delete("/miniapps/:appId", (req, res) => {
  const { appId } = req.params;

  const catalog = readMiniAppsCatalog();
  const filtered = catalog.filter(a => a.id !== appId);

  if (filtered.length === catalog.length) {
    return res.status(404).json({
      success: false,
      message: "Mini-app non trouvée"
    });
  }

  writeMiniAppsCatalog(filtered);

  res.json({
    success: true,
    message: "Mini-app supprimée"
  });
});

// Get analytics data
router.get("/analytics", async (req, res) => {
  const { period = "30d" } = req.query;

  let usersList = [];
  if (db) {
    const { data: rows } = await db.from("users").select("user_id,created_at");
    if (rows) usersList = rows.map((row) => ({ userId: row.user_id, createdAt: row.created_at }));
  }
  if (!usersList.length) {
    usersList = readUsersStore();
  }

  let transactionsList = [];
  if (db) {
    const { data: rows } = await db.from("ussd_transactions").select("amount,status,completed_at,created_at");
    if (rows) transactionsList = rows.map((row) => ({ amount: row.amount, status: row.status, completedAt: row.completed_at, createdAt: row.created_at }));
  }
  if (!transactionsList.length) {
    transactionsList = Object.values(readCollection("ussd-transactions.json", {}));
  }

  const chartData = buildPeriodSeries(period, usersList, transactionsList.filter((tx) => tx.status !== "failed"));
  const topApps = readMiniAppsCatalog()
    .sort((a, b) => (Number(b.installations) || 0) - (Number(a.installations) || 0))
    .slice(0, 5)
    .map((app) => ({
      name: app.name,
      installations: Number(app.installations) || 0,
      uniqueUsers: Number(app.uniqueUsers) || (Array.isArray(app.installedUsers) ? app.installedUsers.length : 0),
      uniquePhones: Number(app.uniquePhones) || (Array.isArray(app.installedPhones) ? app.installedPhones.length : 0)
    }));

  res.json({
    success: true,
    period,
    chartData,
    topApps
  });
});

export default router;
