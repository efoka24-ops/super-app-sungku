import { Router } from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";
import { defaultStats } from "../lib/defaults.js";

const router = Router();

function rowToUser(r) {
  return { userId: r.user_id, firstName: r.first_name, lastName: r.last_name, phone: r.phone, email: r.email, language: r.language, avatar: r.avatar, createdAt: r.created_at };
}

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (db) {
    const { data } = await db.from("users").select("*").eq("user_id", userId).maybeSingle();
    if (data) return res.json(rowToUser(data));
  }
  const users = readCollection("users.json", {});
  const user = users[userId];
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ userId: user.userId, firstName: user.firstName, lastName: user.lastName, phone: user.phone, email: user.email, language: user.language || "fr", createdAt: user.createdAt });
});

router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, phone, email, language } = req.body || {};
  const now = nowIso();
  const patch = { first_name: firstName, last_name: lastName, phone, email, language, updated_at: now };
  Object.keys(patch).forEach(k => patch[k] === undefined && delete patch[k]);

  if (db) await db.from("users").update(patch).eq("user_id", userId).catch(e => console.error("Supabase profile update:", e.message));

  const users = readCollection("users.json", {});
  const user  = users[userId];
  if (!user) return res.status(404).json({ message: "User not found" });
  users[userId] = { ...user, firstName: firstName ?? user.firstName, lastName: lastName ?? user.lastName, phone: phone ?? user.phone, email: email ?? user.email, language: language ?? user.language, updatedAt: now };
  writeCollection("users.json", users);
  return res.json({ message: "Profile updated", user: users[userId] });
});

router.get("/:userId/stats", async (req, res) => {
  const { userId } = req.params;
  const miniAppsCount = Number(req.query.miniApps || 0);
  const statsStore = readCollection("profile-stats.json", {});
  if (!statsStore[userId]) { statsStore[userId] = defaultStats(userId, miniAppsCount); writeCollection("profile-stats.json", statsStore); }
  const s = statsStore[userId];

  if (db) {
    await db.from("profile_stats").upsert({ user_id: userId, transfers: s.transfers || 0, contacts: s.contacts || 0, mini_apps: s.miniApps || 0, updated_at: nowIso() }, { onConflict: "user_id" }).catch(() => {});
  }
  return res.json({ userId, stats: s });
});

router.put("/:userId/stats", async (req, res) => {
  const { userId } = req.params;
  const statsStore = readCollection("profile-stats.json", {});
  const current = statsStore[userId] || defaultStats(userId, Number(req.body?.miniApps || 0));
  statsStore[userId] = {
    ...current,
    transfers: Number.isFinite(Number(req.body?.transfers)) ? Number(req.body.transfers) : current.transfers,
    contacts:  Number.isFinite(Number(req.body?.contacts))  ? Number(req.body.contacts)  : current.contacts,
    miniApps:  Number.isFinite(Number(req.body?.miniApps))  ? Number(req.body.miniApps)  : current.miniApps,
    updatedAt: nowIso(),
  };
  writeCollection("profile-stats.json", statsStore);
  const s = statsStore[userId];
  if (db) await db.from("profile_stats").upsert({ user_id: userId, transfers: s.transfers, contacts: s.contacts, mini_apps: s.miniApps, updated_at: s.updatedAt }, { onConflict: "user_id" }).catch(() => {});
  return res.json({ userId, stats: s });
});

// Upload/Update profile avatar
router.post("/:userId/avatar", async (req, res) => {
  const { userId } = req.params;
  const { avatar } = req.body || {};
  if (!avatar) return res.status(400).json({ message: "Avatar data required" });

  const now = nowIso();
  if (db) await db.from("users").update({ avatar, updated_at: now }).eq("user_id", userId).catch(e => console.error("Supabase avatar:", e.message));

  const users = readCollection("users.json", {});
  const user  = users[userId];
  if (!user) return res.status(404).json({ message: "User not found" });
  users[userId] = { ...user, avatar, updatedAt: now };
  writeCollection("users.json", users);
  return res.json({ message: "Avatar updated", user: { userId, avatar } });
});

// Get profile with avatar
router.get("/:userId/full", async (req, res) => {
  const { userId } = req.params;
  if (db) {
    const { data } = await db.from("users").select("*").eq("user_id", userId).maybeSingle();
    if (data) return res.json({ userId: data.user_id, firstName: data.first_name, lastName: data.last_name, phone: data.phone, email: data.email, language: data.language || "fr", avatar: data.avatar || null, createdAt: data.created_at });
  }
  const users = readCollection("users.json", {});
  const user  = users[userId];
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ userId: user.userId, firstName: user.firstName, lastName: user.lastName, phone: user.phone, email: user.email, language: user.language || "fr", avatar: user.avatar || null, createdAt: user.createdAt });
});

export default router;
