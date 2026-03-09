import { Router } from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";
import { buildUserId, createToken } from "../lib/userId.js";
import { defaultNotifications } from "../lib/defaults.js";

const router = Router();

router.post("/signup", (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body || {};
  if (!firstName || !lastName || !phone || !password) {
    return res.status(400).json({ message: "Missing required signup fields" });
  }

  const users = readCollection("users.json", {});
  const userId = buildUserId({ phone, email, firstName, lastName });

  if (users[userId]) {
    return res.status(409).json({ message: "User already exists" });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));

  users[userId] = {
    userId,
    firstName,
    lastName,
    phone,
    email: email || "",
    password,
    verified: false,
    language: "fr",
    createdAt: nowIso(),
    otp,
  };

  writeCollection("users.json", users);

  const notifications = readCollection("notifications.json", {});
  notifications[userId] = defaultNotifications();
  writeCollection("notifications.json", notifications);

  return res.status(201).json({ userId, otp, message: "Signup created. Verify OTP to activate account." });
});

router.post("/verify-otp", (req, res) => {
  const { userId, otp } = req.body || {};
  const users = readCollection("users.json", {});
  const user = users[userId];

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (String(user.otp) !== String(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.verified = true;
  user.otp = null;
  user.updatedAt = nowIso();
  users[userId] = user;
  writeCollection("users.json", users);

  return res.json({ message: "Phone verified", userId, token: createToken(userId) });
});

router.post("/signin", (req, res) => {
  const { login, password } = req.body || {};
  const users = readCollection("users.json", {});

  const user = Object.values(users).find(
    (item) => (item.phone === login || item.email === login || item.userId === login) && item.password === password,
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.verified) {
    return res.status(403).json({ message: "Account not verified" });
  }

  return res.json({
    token: createToken(user.userId),
    user: {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      language: user.language || "fr",
    },
  });
});

export default router;
