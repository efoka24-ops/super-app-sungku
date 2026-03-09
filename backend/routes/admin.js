import express from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = express.Router();

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
router.get("/dashboard-stats", (req, res) => {
  const users = readCollection("users.json", {});
  const profileStats = readCollection("profile-stats.json", {});
  const ussdTransactions = readCollection("ussd-transactions.json", {});
  const miniApps = readCollection("miniapps-catalog.json", []);

  // Count real users
  const usersList = Array.isArray(users) ? users : Object.values(users);
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u.verified).length;

  // Count real transactions
  const transactionsList = Object.values(ussdTransactions || {});
  const totalTransactions = transactionsList.length;
  const completedTransactions = transactionsList.filter(t => t.status === "completed");
  
  // Calculate total revenue (amount of completed transactions)
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Recent activity from all transactions
  const recentActivity = transactionsList
    .filter(t => t.status === "completed")
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5)
    .map(t => {
      const user = usersList.find(u => u.userId === t.userId);
      return {
        id: t.transactionId,
        user: user ? `${user.firstName} ${user.lastName}` : "Anonyme",
        action: `Envoi de ${(t.amount / 1000).toFixed(1)}K FCFA`,
        timestamp: t.completedAt
      };
    });

  // Add user signups to activity
  usersList
    .filter(u => u.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .forEach(u => {
      recentActivity.push({
        id: `user-${u.userId}`,
        user: `${u.firstName} ${u.lastName}`,
        action: "Inscription",
        timestamp: u.createdAt
      });
    });

  // Sort all activity by timestamp descending and take 10
  const allActivity = recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  res.json({
    success: true,
    totalUsers,
    activeUsers,
    totalTransactions,
    totalRevenue,
    miniAppsCount: miniApps.length,
    recentActivity: allActivity
  });
});

// Get users with search/filter
router.get("/users", (req, res) => {
  const { search, status, limit = 100, offset = 0 } = req.query;

  const usersData = readCollection("users.json", {});
  
  // Convert object to array if needed
  let allUsers = Array.isArray(usersData) ? usersData : Object.values(usersData);
  
  let filtered = allUsers;
  
  if (search) {
    const s = search.toLowerCase();
    filtered = allUsers.filter(u =>
      (u.firstName?.toLowerCase() || '').includes(s) ||
      (u.lastName?.toLowerCase() || '').includes(s) ||
      (u.email?.toLowerCase() || '').includes(s) ||
      (u.phone || '').includes(search)
    );
  }

  if (status && status !== "all") {
    filtered = filtered.filter(u => u.status === status);
  }

  const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    success: true,
    users: paginated,
    total: filtered.length,
    limit: Number(limit),
    offset: Number(offset)
  });
});

// Update user status
router.patch("/users/:userId/status", (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const users = readCollection("users.json", []);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Utilisateur non trouvé"
    });
  }

  user.status = status;
  user.updatedAt = nowIso();
  writeCollection("users.json", users);

  res.json({
    success: true,
    message: `Utilisateur ${status}`,
    user
  });
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

  const catalog = readCollection("miniapps-catalog.json", []);
  const app = catalog.find(a => a.id === appId);

  if (!app) {
    return res.status(404).json({
      success: false,
      message: "Mini-app non trouvée"
    });
  }

  app.published = published;
  writeCollection("miniapps-catalog.json", catalog);

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

  const catalog = readCollection("miniapps-catalog.json", []);
  const app = catalog.find(a => a.id === appId);

  if (!app) {
    return res.status(404).json({
      success: false,
      message: "Mini-app non trouvée"
    });
  }

  app.featured = featured;
  writeCollection("miniapps-catalog.json", catalog);

  res.json({
    success: true,
    message: featured ? "Mini-app en vedette" : "Mini-app retirée de la vedette",
    miniApp: app
  });
});

// Delete mini-app
router.delete("/miniapps/:appId", (req, res) => {
  const { appId } = req.params;

  const catalog = readCollection("miniapps-catalog.json", []);
  const filtered = catalog.filter(a => a.id !== appId);

  if (filtered.length === catalog.length) {
    return res.status(404).json({
      success: false,
      message: "Mini-app non trouvée"
    });
  }

  writeCollection("miniapps-catalog.json", filtered);

  res.json({
    success: true,
    message: "Mini-app supprimée"
  });
});

// Get analytics data
router.get("/analytics", (req, res) => {
  const { period = "30d" } = req.query;

  const analyticsData = {
    "7d": {
      userGrowth: [
        { date: "Mon", users: 1200 },
        { date: "Tue", users: 1900 },
        { date: "Wed", users: 2200 },
        { date: "Thu", users: 2290 },
        { date: "Fri", users: 2390 },
        { date: "Sat", users: 2490 },
        { date: "Sun", users: 2590 }
      ]
    },
    "30d": {
      userGrowth: [
        { date: "Week 1", users: 8500 },
        { date: "Week 2", users: 10200 },
        { date: "Week 3", users: 12100 },
        { date: "Week 4", users: 15234 }
      ]
    },
    "90d": {
      userGrowth: [
        { date: "Jan", users: 8000 },
        { date: "Feb", users: 10500 },
        { date: "Mar", users: 15234 }
      ]
    },
    "1y": {
      userGrowth: [
        { date: "Jan", users: 5000 },
        { date: "Feb", users: 6200 },
        { date: "Mar", users: 7800 },
        { date: "Apr", users: 9100 },
        { date: "May", users: 11500 },
        { date: "Jun", users: 15234 }
      ]
    }
  };

  const data = analyticsData[period] || analyticsData["30d"];

  res.json({
    success: true,
    period,
    data,
    topApps: [
      { name: "Livraison Express", installations: 12450 },
      { name: "Pharmacie Online", installations: 8920 },
      { name: "Location Voiture", installations: 3200 },
      { name: "Taxi Service", installations: 2850 },
      { name: "Food Delivery", installations: 2100 }
    ]
  });
});

export default router;
