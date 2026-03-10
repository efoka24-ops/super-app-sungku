import { Router } from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = Router();

router.put("/:userId/language", async (req, res) => {
  const { userId } = req.params;
  const { language } = req.body || {};
  if (!language) return res.status(400).json({ message: "language required" });
  const now = nowIso();
  if (db) await db.from("users").update({ language, updated_at: now }).eq("user_id", userId).catch(e => console.error("Supabase lang:", e.message));
  const users = readCollection("users.json", {});
  if (users[userId]) { users[userId].language = language; users[userId].updatedAt = now; writeCollection("users.json", users); }
  return res.json({ message: "Language updated", language });
});

router.put("/:userId/security", async (req, res) => {
  const { userId } = req.params;
  const { newPassword, twoFactorEnabled, biometricsEnabled } = req.body || {};
  const now = nowIso();
  const patch = {};
  if (newPassword)            patch.password           = newPassword;
  if (twoFactorEnabled  !== undefined) patch.two_factor_enabled  = twoFactorEnabled;
  if (biometricsEnabled !== undefined) patch.biometrics_enabled  = biometricsEnabled;
  patch.updated_at = now;
  if (db) await db.from("users").update(patch).eq("user_id", userId).catch(e => console.error("Supabase security:", e.message));
  const users = readCollection("users.json", {});
  if (users[userId]) {
    if (newPassword)            users[userId].password           = newPassword;
    if (twoFactorEnabled  !== undefined) users[userId].twoFactorEnabled  = twoFactorEnabled;
    if (biometricsEnabled !== undefined) users[userId].biometricsEnabled = biometricsEnabled;
    users[userId].updatedAt = now;
    writeCollection("users.json", users);
  }
  return res.json({ message: "Security settings updated" });
});

export default router;
