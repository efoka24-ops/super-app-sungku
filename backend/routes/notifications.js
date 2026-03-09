import { Router } from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";
import { defaultNotifications } from "../lib/defaults.js";

const router = Router();

router.get("/:userId", (req, res) => {
  const store = readCollection("notifications.json", {});
  if (!store[req.params.userId]) {
    store[req.params.userId] = defaultNotifications();
    writeCollection("notifications.json", store);
  }

  const filter = req.query.filter;
  const all = store[req.params.userId];
  const notifications = filter === "unread" ? all.filter((item) => !item.read) : all;

  return res.json({ userId: req.params.userId, notifications });
});

router.post("/:userId", (req, res) => {
  const { title, message, type = "system" } = req.body || {};
  if (!title || !message) {
    return res.status(400).json({ message: "Missing title or message" });
  }

  const store = readCollection("notifications.json", {});
  const current = store[req.params.userId] || [];
  const next = {
    id: `notif_${Date.now()}`,
    title,
    message,
    type,
    read: false,
    createdAt: nowIso(),
  };

  store[req.params.userId] = [next, ...current];
  writeCollection("notifications.json", store);
  return res.status(201).json({ message: "Notification created", notification: next });
});

router.patch("/:userId/:notificationId/read", (req, res) => {
  const { userId, notificationId } = req.params;
  const store = readCollection("notifications.json", {});
  const current = store[userId] || [];

  store[userId] = current.map((item) =>
    item.id === notificationId ? { ...item, read: true, readAt: nowIso() } : item,
  );

  writeCollection("notifications.json", store);
  return res.json({ message: "Notification marked as read" });
});

router.patch("/:userId/read-all", (req, res) => {
  const { userId } = req.params;
  const store = readCollection("notifications.json", {});
  const current = store[userId] || [];

  store[userId] = current.map((item) => ({ ...item, read: true, readAt: nowIso() }));
  writeCollection("notifications.json", store);
  return res.json({ message: "All notifications marked as read" });
});

router.delete("/:userId/:notificationId", (req, res) => {
  const { userId, notificationId } = req.params;
  const store = readCollection("notifications.json", {});
  const current = store[userId] || [];
  store[userId] = current.filter((item) => item.id !== notificationId);
  writeCollection("notifications.json", store);
  return res.json({ message: "Notification deleted" });
});

export default router;
