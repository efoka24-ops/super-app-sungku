import { Router } from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";
import { buildUserId, createToken } from "../lib/userId.js";
import { defaultNotifications } from "../lib/defaults.js";

const router = Router();

// Map DB row (snake_case) → app object (camelCase)
function rowToUser(r) {
  return {
    userId: r.user_id,
    firstName: r.first_name,
    lastName: r.last_name,
    phone: r.phone,
    email: r.email,
    password: r.password,
    verified: r.verified,
    language: r.language,
    otp: r.otp,
    avatar: r.avatar,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body || {};
    if (!firstName || !lastName || !phone || !password) {
      return res.status(400).json({ message: "Missing required signup fields" });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const userId = buildUserId({ phone: normalizedPhone, email, firstName, lastName });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const now = nowIso();

    // ── Supabase (primary) ──────────────────────────────────────
    if (db) {
      let existing = null;

      const { data: byPhoneRows, error: byPhoneError } = await db
        .from("users")
        .select("user_id,verified")
        .eq("phone", normalizedPhone)
        .limit(1);
      if (byPhoneError) {
        console.error("Supabase signup lookup phone:", byPhoneError.message);
      }
      existing = byPhoneRows?.[0] || null;

      if (!existing && email) {
        const { data: byEmailRows, error: byEmailError } = await db
          .from("users")
          .select("user_id,verified")
          .eq("email", email)
          .limit(1);
        if (byEmailError) {
          console.error("Supabase signup lookup email:", byEmailError.message);
        }
        existing = byEmailRows?.[0] || null;
      }

      if (!existing) {
        const { data: byUserIdRows, error: byUserIdError } = await db
          .from("users")
          .select("user_id,verified")
          .eq("user_id", userId)
          .limit(1);
        if (byUserIdError) {
          console.error("Supabase signup lookup user_id:", byUserIdError.message);
        }
        existing = byUserIdRows?.[0] || null;
      }

      if (existing?.verified) {
        return res.status(409).json({ message: "User already exists" });
      }

      if (existing && !existing.verified) {
        const { error: updateError } = await db
          .from("users")
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: normalizedPhone,
            email: email || "",
            password,
            otp,
            updated_at: now,
          })
          .eq("user_id", existing.user_id);
        if (updateError) {
          console.error("Supabase signup update:", updateError.message);
          return res.status(500).json({ message: "Signup failed" });
        }

        return res.status(200).json({
          userId: existing.user_id,
          otp,
          message: "OTP resent. Verify to activate account.",
        });
      }

      const { error } = await db.from("users").insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        phone: normalizedPhone,
        email: email || "",
        password,
        verified: false,
        language: "fr",
        otp,
        created_at: now,
      });
      if (error) {
        console.error("Supabase signup insert:", error.message);
        if (error.code === "23505") {
          return res.status(409).json({ message: "User already exists" });
        }
        return res.status(500).json({ message: "Signup failed" });
      }

      // default notifications in Supabase
      const notifs = defaultNotifications();
      const { error: notifError } = await db.from("notifications").insert(
        notifs.map((n) => ({
          id: n.id,
          user_id: userId,
          title: n.title,
          message: n.message,
          type: n.type,
          read: false,
          created_at: n.createdAt,
        }))
      );
      if (notifError) console.error("Supabase notifications seed:", notifError.message);
    }

    // ── JSON backup ─────────────────────────────────────────────
    const users = readCollection("users.json", {});
    if (users[userId] && !db) return res.status(409).json({ message: "User already exists" });
    users[userId] = {
      userId,
      firstName,
      lastName,
      phone: normalizedPhone,
      email: email || "",
      password,
      verified: false,
      language: "fr",
      createdAt: now,
      otp,
    };
    writeCollection("users.json", users);
    const notificationsStore = readCollection("notifications.json", {});
    notificationsStore[userId] = defaultNotifications();
    writeCollection("notifications.json", notificationsStore);

    return res.status(201).json({ userId, otp, message: "Signup created. Verify OTP to activate account." });
  } catch (error) {
    console.error("Signup route crash:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
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
  const normalizedLogin = normalizePhone(login);
  let user;

  if (db) {
    const lookups = [
      db.from("users").select("*").eq("phone", String(login || "")),
      db.from("users").select("*").eq("email", String(login || "")),
      db.from("users").select("*").eq("user_id", String(login || "")),
    ];
    if (normalizedLogin && normalizedLogin !== String(login || "")) {
      lookups.push(db.from("users").select("*").eq("phone", normalizedLogin));
      lookups.push(db.from("users").select("*").eq("user_id", normalizedLogin));
    }

    const results = await Promise.allSettled(lookups.map(q => q));
    const seen = new Set();
    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      for (const row of r.value?.data || []) {
        if (seen.has(row.user_id)) continue;
        seen.add(row.user_id);
        if (row.password === password) {
          user = rowToUser(row);
          break;
        }
      }
      if (user) break;
    }
  }

  if (!user) {
    const users = readCollection("users.json", {});
    user = Object.values(users).find(
      (u) =>
        (u.phone === login ||
          u.phone === normalizedLogin ||
          u.email === login ||
          u.userId === login ||
          u.userId === normalizedLogin) &&
        u.password === password
    );
  }

  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  if (!user.verified) return res.status(403).json({ message: "Account not verified" });

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
