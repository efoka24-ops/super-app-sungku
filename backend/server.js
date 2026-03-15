import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { readCollection, writeCollection, nowIso } from "./lib/store.js";
import { defaultStats } from "./lib/defaults.js";
import db from "./lib/db.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import contactsRoutes from "./routes/contacts.js";
import miniAppsRoutes from "./routes/miniapps.js";
import notificationsRoutes from "./routes/notifications.js";
import settingsRoutes from "./routes/settings.js";
import helpRoutes from "./routes/help.js";
import adminRoutes from "./routes/admin.js";
import ussdRoutes from "./routes/ussd.js";
import cinetPayRoutes from "./routes/cinetpay.js";
import cinetPayTransferRoutes from "./routes/cinetpayTransfer.js";
import notchPayTransferRoutes from "./routes/notchpayTransfer.js";
import notchPayPaymentsRoutes from "./routes/notchpayPayments.js";
import notchPayCustomersRoutes from "./routes/notchpayCustomers.js";
import notchPayBeneficiariesRoutes from "./routes/notchpayBeneficiaries.js";
import smsRoutes from "./routes/sms.js";
import messagesRoutes from "./routes/messages.js";
import otpRoutes from "./routes/otp.js";
import campayRoutes from "./routes/campay.js";


const app = express();
const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 4000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS renforcé pour Render
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for avatar uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check universel
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "sungku-backend",
    timestamp: new Date().toISOString(),
    firestoreConfigured: Boolean(db),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/miniapps", miniAppsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/help", helpRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ussd", ussdRoutes);
app.use("/api/cinetpay", cinetPayRoutes);
app.use("/api/cinetpay-transfer", cinetPayTransferRoutes);
app.use("/api/notchpay-transfer", notchPayTransferRoutes);
app.use("/api/notchpay-payments", notchPayPaymentsRoutes);
app.use("/api/notchpay-customers", notchPayCustomersRoutes);
app.use("/api/notchpay-beneficiaries", notchPayBeneficiariesRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/campay", campayRoutes);

// Backward compatibility with current frontend endpoint
app.get("/api/profile/stats", (req, res) => {
  const { userId, miniApps = 0 } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "Missing userId query parameter" });
  }

  const statsStore = readCollection("profile-stats.json", {});
  const key = String(userId);

  if (!statsStore[key]) {
    statsStore[key] = defaultStats(key, Number(miniApps));
    writeCollection("profile-stats.json", statsStore);
  }

  return res.json({ userId: key, stats: statsStore[key] });
});

app.put("/api/profile/stats", (req, res) => {
  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ message: "Missing userId in body" });
  }

  const key = String(userId);
  const statsStore = readCollection("profile-stats.json", {});
  const current = statsStore[key] || defaultStats(key, Number(req.body?.miniApps || 0));

  statsStore[key] = {
    ...current,
    transfers: Number.isFinite(Number(req.body?.transfers)) ? Number(req.body.transfers) : current.transfers,
    contacts: Number.isFinite(Number(req.body?.contacts)) ? Number(req.body.contacts) : current.contacts,
    miniApps: Number.isFinite(Number(req.body?.miniApps)) ? Number(req.body.miniApps) : current.miniApps,
    updatedAt: nowIso(),
  };

  writeCollection("profile-stats.json", statsStore);
  return res.json({ userId: key, stats: statsStore[key] });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;

if (!process.env.VERCEL) {
  const MAX_PORT_ATTEMPTS = 10;

  function startServer(port, attemptsLeft) {
    const server = app.listen(port, () => {
      console.log(`Sungku backend API running on http://localhost:${port}`);
    });

    server.on("error", (err) => {
      if (err && err.code === "EADDRINUSE" && attemptsLeft > 0) {
        console.warn(`Port ${port} déjà utilisé. Tentative sur ${port + 1}...`);
        startServer(port + 1, attemptsLeft - 1);
        return;
      }

      console.error("Impossible de démarrer le backend:", err?.message || err);
      process.exit(1);
    });
  }

  startServer(PORT, MAX_PORT_ATTEMPTS);
}
