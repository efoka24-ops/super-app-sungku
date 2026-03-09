import { Router } from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = Router();

router.put("/:userId/language", (req, res) => {
  const { userId } = req.params;
  const { language } = req.body || {};

  if (!language || !["fr", "en"].includes(language)) {
    return res.status(400).json({ message: "Language must be fr or en" });
  }

  const users = readCollection("users.json", {});
  if (!users[userId]) {
    return res.status(404).json({ message: "User not found" });
  }

  users[userId] = {
    ...users[userId],
    language,
    updatedAt: nowIso(),
  };

  writeCollection("users.json", users);
  return res.json({ message: "Language updated", language });
});

router.put("/:userId/security", (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword, twoFactorEnabled } = req.body || {};

  const users = readCollection("users.json", {});
  if (!users[userId]) {
    return res.status(404).json({ message: "User not found" });
  }

  if (currentPassword && newPassword) {
    if (users[userId].password !== currentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    users[userId].password = newPassword;
  }

  users[userId].twoFactorEnabled = Boolean(twoFactorEnabled);
  users[userId].updatedAt = nowIso();

  writeCollection("users.json", users);

  return res.json({
    message: "Security settings updated",
    twoFactorEnabled: users[userId].twoFactorEnabled,
  });
});

export default router;
