import { Router } from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";
import { buildUserId, createToken } from "../lib/userId.js";
import { defaultNotifications } from "../lib/defaults.js";

const router = Router();

// Map DB row (snake_case) → app object (camelCase)
function rowToUser(r) {
  return {
    userId: r.user_id, firstName: r.first_name, lastName: r.last_name,
    phone: r.phone, email: r.email, password: r.password,
    verified: r.verified, language: r.language, otp: r.otp,
    avatar: r.avatar, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

router.post("/signup", async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body || {};
  if (!firstName || !lastName || !phone || !password) {
    return res.status(400).json({ message: "Missing required signup fields" });
  }

  const userId = buildUserId({ phone, email, firstName, lastName });
  const otp    = String(Math.floor(100000 + Math.random() * 900000));
  const now    = nowIso();

  // ── Supabase (primary) ──────────────────────────────────────
  if (db) {
    const lookup = [
      `phone.eq.${phone}`,
      `user_id.eq.${userId}`,
    ];
    if (email) lookup.push(`email.eq.${email}`);

    const { data: existingRows } = await db
      .from("users")
      .select("user_id,verified")
      .or(lookup.join(","))
      .limit(1);

    const existing = existingRows?.[0];
    if (existing?.verified) {
      return res.status(409).json({ message: "User already exists" });
    }

    if (existing && !existing.verified) {
      const { error: updateError } = await db
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          email: email || "",
          password,
          otp,
          updated_at: now,
        })
        .eq("user_id", existing.user_id);
      if (updateError) console.error("Supabase signup update:", updateError.message);

      return res.status(200).json({ userId: existing.user_id, otp, message: "OTP resent. Verify to activate account." });
    }

    const { error } = await db.from("users").insert({
      user_id: userId, first_name: firstName, last_name: lastName,
      phone, email: email || "", password, verified: false,
      language: "fr", otp, created_at: now,
    });
    if (error) {
      console.error("Supabase signup insert:", error.message);
      return res.status(500).json({ message: "Signup failed" });
    }

    // default notifications in Supabase
    const notifs = defaultNotifications();
    const { error: notifError } = await db.from("notifications").insert(
      notifs.map(n => ({ id: n.id, user_id: userId, title: n.title, message: n.message, type: n.type, read: false, created_at: n.createdAt }))
    );
    if (notifError) console.error("Supabase notifications seed:", notifError.message);
  }

  // ── JSON backup ─────────────────────────────────────────────
  const users = readCollection("users.json", {});
  if (users[userId] && !db) return res.status(409).json({ message: "User already exists" });
  users[userId] = { userId, firstName, lastName, phone, email: email || "", password, verified: false, language: "fr", createdAt: now, otp };
  writeCollection("users.json", users);
  const notificationsStore = readCollection("notifications.json", {});
  notificationsStore[userId] = defaultNotifications();
  writeCollection("notifications.json", notificationsStore);

  return res.status(201).json({ userId, otp, message: "Signup created. Verify OTP to activate account." });
});

router.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body || {};
  let user;

  if (db) {
    const { data } = await db.from("users").select("*").eq("user_id", userId).maybeSingle();
    if (data) user = rowToUser(data);
  }
  if (!user) {
    const users = readCollection("users.json", {});
    user = users[userId];
  }
  if (!user) return res.status(404).json({ message: "User not found" });
  if (String(user.otp) !== String(otp)) return res.status(400).json({ message: "Invalid OTP" });

  const now = nowIso();
  if (db) {
    const { error: verifyError } = await db.from("users").update({ verified: true, otp: null, updated_at: now }).eq("user_id", userId);
    if (verifyError) console.error("Supabase verify:", verifyError.message);
  }
  const users = readCollection("users.json", {});
  if (users[userId]) { users[userId].verified = true; users[userId].otp = null; users[userId].updatedAt = now; writeCollection("users.json", users); }

  return res.json({ message: "Phone verified", userId, token: createToken(userId) });
});

router.post("/signin", async (req, res) => {
  const { login, password } = req.body || {};
  let user;

  if (db) {
    const { data: rows } = await db.from("users").select("*")
      .or(`phone.eq.${login},email.eq.${login},user_id.eq.${login}`);
    if (rows?.length) {
      const match = rows.find(r => r.password === password);
      if (match) user = rowToUser(match);
    }
  }
  if (!user) {
    const users = readCollection("users.json", {});
    user = Object.values(users).find(u => (u.phone === login || u.email === login || u.userId === login) && u.password === password);
  }
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  if (!user.verified) return res.status(403).json({ message: "Account not verified" });

  return res.json({
    token: createToken(user.userId),
    user: { userId: user.userId, firstName: user.firstName, lastName: user.lastName, phone: user.phone, email: user.email, language: user.language || "fr" },
  });
});

export default router;
