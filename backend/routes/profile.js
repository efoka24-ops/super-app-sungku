import { Router } from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";
import { defaultStats } from "../lib/defaults.js";

const router = Router();

router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const users = readCollection("users.json", {});
  const user = users[userId];

  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json({
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
    language: user.language || "fr",
    createdAt: user.createdAt,
  });
});

router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const users = readCollection("users.json", {});
  const user = users[userId];

  if (!user) return res.status(404).json({ message: "User not found" });

  const { firstName, lastName, phone, email, language } = req.body || {};
  users[userId] = {
    ...user,
    firstName: firstName ?? user.firstName,
    lastName: lastName ?? user.lastName,
    phone: phone ?? user.phone,
    email: email ?? user.email,
    language: language ?? user.language,
    updatedAt: nowIso(),
  };

  writeCollection("users.json", users);

  return res.json({ message: "Profile updated", user: users[userId] });
});

router.get("/:userId/stats", (req, res) => {
  const { userId } = req.params;
  const miniAppsCount = Number(req.query.miniApps || 0);
  const statsStore = readCollection("profile-stats.json", {});

  if (!statsStore[userId]) {
    statsStore[userId] = defaultStats(userId, miniAppsCount);
    writeCollection("profile-stats.json", statsStore);
  } else {
    const current = statsStore[userId];
    const isLegacyShape =
      !current ||
      typeof current !== "object" ||
      current.userId !== userId ||
      !Array.isArray(current.transactions) ||
      typeof current.balance !== "number";

    if (isLegacyShape) {
      statsStore[userId] = defaultStats(userId, miniAppsCount);
      writeCollection("profile-stats.json", statsStore);
    }
  }

  return res.json({ userId, stats: statsStore[userId] });
});

router.put("/:userId/stats", (req, res) => {
  const { userId } = req.params;
  const statsStore = readCollection("profile-stats.json", {});
  const current = statsStore[userId] || defaultStats(userId, Number(req.body?.miniApps || 0));

  statsStore[userId] = {
    ...current,
    transfers: Number.isFinite(Number(req.body?.transfers)) ? Number(req.body.transfers) : current.transfers,
    contacts: Number.isFinite(Number(req.body?.contacts)) ? Number(req.body.contacts) : current.contacts,
    miniApps: Number.isFinite(Number(req.body?.miniApps)) ? Number(req.body.miniApps) : current.miniApps,
    updatedAt: nowIso(),
  };

  writeCollection("profile-stats.json", statsStore);
  return res.json({ userId, stats: statsStore[userId] });
});

// Upload/Update profile avatar
router.post("/:userId/avatar", (req, res) => {
  const { userId } = req.params;
  const { avatar } = req.body || {};

  if (!avatar) {
    return res.status(400).json({ message: "Avatar data required" });
  }

  const users = readCollection("users.json", {});
  const user = users[userId];

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Store avatar data in user profile
  users[userId] = {
    ...user,
    avatar: avatar,
    updatedAt: nowIso(),
  };

  writeCollection("users.json", users);

  return res.json({
    message: "Avatar updated",
    user: {
      userId: users[userId].userId,
      avatar: users[userId].avatar,
    },
  });
});

// Get profile with avatar
router.get("/:userId/full", (req, res) => {
  const { userId } = req.params;
  const users = readCollection("users.json", {});
  const user = users[userId];

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email,
    language: user.language || "fr",
    avatar: user.avatar || null,
    createdAt: user.createdAt,
  });
});

export default router;
