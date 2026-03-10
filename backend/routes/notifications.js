import { Router } from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";
import { defaultNotifications } from "../lib/defaults.js";

const router = Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const filter = req.query.filter;
  if (db) {
    const { data } = await db.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) {
      const mapped = data.map(r => ({ id: r.id, userId: r.user_id, title: r.title, message: r.message, type: r.type, read: r.read, readAt: r.read_at, createdAt: r.created_at }));
      return res.json({ userId, notifications: filter === "unread" ? mapped.filter(n => !n.read) : mapped });
    }
  }
  const store = readCollection("notifications.json", {});
  if (!store[userId]) { store[userId] = defaultNotifications(); writeCollection("notifications.json", store); }
  const all = store[userId];
  return res.json({ userId, notifications: filter === "unread" ? all.filter(n => !n.read) : all });
});

router.post("/:userId", async (req, res) => {
  const { title, message, type = "system" } = req.body || {};
  if (!title || !message) return res.status(400).json({ message: "Missing title or message" });
  const { userId } = req.params;
  const id  = `notif_${Date.now()}`;
  const now = nowIso();
  const notif = { id, userId, title, message, type, read: false, createdAt: now };

  if (db) await db.from("notifications").insert({ id, user_id: userId, title, message, type, read: false, created_at: now }).catch(e => console.error("Supabase notif insert:", e.message));
  const store = readCollection("notifications.json", {});
  store[userId] = [notif, ...(store[userId] || [])];
  writeCollection("notifications.json", store);
  return res.status(201).json({ message: "Notification created", notification: notif });
});

router.patch("/:userId/:notificationId/read", async (req, res) => {
  const { userId, notificationId } = req.params;
  const now = nowIso();
  if (db) await db.from("notifications").update({ read: true, read_at: now }).eq("id", notificationId).eq("user_id", userId).catch(() => {});
  const store = readCollection("notifications.json", {});
  store[userId] = (store[userId] || []).map(n => n.id === notificationId ? { ...n, read: true, readAt: now } : n);
  writeCollection("notifications.json", store);
  return res.json({ message: "Notification marked as read" });
});

router.patch("/:userId/read-all", async (req, res) => {
  const { userId } = req.params;
  const now = nowIso();
  if (db) await db.from("notifications").update({ read: true, read_at: now }).eq("user_id", userId).catch(() => {});
  const store = readCollection("notifications.json", {});
  store[userId] = (store[userId] || []).map(n => ({ ...n, read: true, readAt: now }));
  writeCollection("notifications.json", store);
  return res.json({ message: "All notifications marked as read" });
});

router.delete("/:userId/:notificationId", async (req, res) => {
  const { userId, notificationId } = req.params;
  if (db) await db.from("notifications").delete().eq("id", notificationId).eq("user_id", userId).catch(() => {});
  const store = readCollection("notifications.json", {});
  store[userId] = (store[userId] || []).filter(n => n.id !== notificationId);
  writeCollection("notifications.json", store);
  return res.json({ message: "Notification deleted" });
});

export default router;
