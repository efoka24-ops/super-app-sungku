import express from "express";
import cors from "cors";
import { readCollection, writeCollection, nowIso } from "./lib/store.js";
import { defaultStats } from "./lib/defaults.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import contactsRoutes from "./routes/contacts.js";
import miniAppsRoutes from "./routes/miniapps.js";
import notificationsRoutes from "./routes/notifications.js";
import settingsRoutes from "./routes/settings.js";
import helpRoutes from "./routes/help.js";
import adminRoutes from "./routes/admin.js";
import ussdRoutes from "./routes/ussd.js";
import smsRoutes from "./routes/sms.js";
import messagesRoutes from "./routes/messages.js";

const app = express();
const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for avatar uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "sungku-backend", timestamp: new Date().toISOString() });
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
app.use("/api/sms", smsRoutes);
app.use("/api/messages", messagesRoutes);

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

app.listen(PORT, () => {
  console.log(`Sungku backend API running on http://localhost:${PORT}`);
});
