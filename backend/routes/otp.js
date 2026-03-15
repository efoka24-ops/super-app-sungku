/**
 * OTP Route — 4-chiffres, backend-driven
 * ─────────────────────────────────────────────────────────────
 * POST /api/otp/send   — génère + envoie un code 4 chiffres par SMS
 * POST /api/otp/verify — vérifie le code (hashed, TTL 5 min, 3 essais max)
 *
 * SMS providers pris en charge (ordre de priorité) :
 *  1. Africa's Talking  (AFRICASTALKING_API_KEY + AFRICASTALKING_USERNAME)
 *  2. Twilio            (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER)
 *  3. Simulation        (console.log — dev uniquement)
 */

import { Router } from "express";
import crypto from "crypto";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";
import { createToken } from "../lib/userId.js";
import db from "../lib/db.js";

const router = Router();

const OTP_TTL_MS         = 5 * 60 * 1000;  // 5 minutes
const MAX_ATTEMPTS       = 3;
const RESEND_COOLDOWN_MS = 60_000;           // 1 minute entre deux envois

// ─── Helpers ────────────────────────────────────────────────

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
}

function generate4Digit() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Normalise un numéro camerounais :
 *   6XXXXXXXX       → +2376XXXXXXXX
 *   2376XXXXXXXX    → +2376XXXXXXXX
 *   +2376XXXXXXXX   → +2376XXXXXXXX
 */
function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 9) return `+237${digits}`;
  if (digits.length === 12 && digits.startsWith("237")) return `+${digits}`;
  // Tolérance : d'autres formats avec 237 présent
  if (digits.startsWith("237") && digits.length > 12) return null;
  return null;
}

function readOtpStore()        { return readCollection("otp-store.json", {}); }
function writeOtpStore(store)  { writeCollection("otp-store.json", store); }

// ─── SMS senders ────────────────────────────────────────────

async function sendViaAfricasTalking(phone, message) {
  const apiKey   = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME;
  if (!apiKey || !username) throw new Error("Africa's Talking non configuré");

  const params = new URLSearchParams({
    username,
    to:      phone,
    message,
    ...(process.env.AFRICASTALKING_SENDER_ID
      ? { from: process.env.AFRICASTALKING_SENDER_ID }
      : {}),
  });

  const response = await fetch("https://api.africastalking.com/version1/messaging", {
    method:  "POST",
    headers: {
      apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept:         "application/json",
    },
    body: params,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Africa's Talking (${response.status}): ${err}`);
  }
  return await response.json();
}

async function sendViaTwilio(phone, message) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) throw new Error("Twilio non configuré");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method:  "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ From: from, To: phone, Body: message }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Twilio (${response.status}): ${err}`);
  }
  return await response.json();
}

/**
 * Envoie le SMS par le premier provider disponible.
 * En dev sans provider, simule l'envoi via console.
 */
async function sendSms(phone, message) {
  if (process.env.AFRICASTALKING_API_KEY) {
    try {
      await sendViaAfricasTalking(phone, message);
      return { sent: true, provider: "africastalking" };
    } catch (e) {
      console.warn("[OTP] Africa's Talking failed:", e.message);
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID) {
    try {
      await sendViaTwilio(phone, message);
      return { sent: true, provider: "twilio" };
    } catch (e) {
      console.warn("[OTP] Twilio failed:", e.message);
    }
  }

  // Simulation (dev uniquement)
  console.log(`\n📱 [SMS SIMULATION] → ${phone}\n   Message: ${message}\n`);
  return { sent: false, provider: "simulation" };
}

// ─── Routes ─────────────────────────────────────────────────

/**
 * POST /api/otp/send
 * Body: { phone: "6XXXXXXXX" | "+237XXXXXXXXX" }
 */
router.post("/send", async (req, res) => {
  const { phone } = req.body || {};
  if (!phone) {
    return res.status(400).json({ success: false, message: "phone requis" });
  }

  const normalized = normalizePhone(phone);
  if (!normalized) {
    return res.status(400).json({
      success: false,
      message: "Numéro invalide. Format attendu : 6XXXXXXXX ou +237XXXXXXXXX",
    });
  }

  // Anti-spam : une demande par minute
  const store    = readOtpStore();
  const existing = store[normalized];
  if (existing && Date.now() - (existing.sentAt || 0) < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.sentAt)) / 1000);
    return res.status(429).json({
      success: false,
      message: `Attendez ${waitSec}s avant de redemander un code.`,
    });
  }

  const code    = generate4Digit();
  const hashed  = hashCode(code);
  const now     = Date.now();

  store[normalized] = {
    hash:      hashed,
    sentAt:    now,
    expiresAt: now + OTP_TTL_MS,
    attempts:  0,
  };
  writeOtpStore(store);

  // Trace DB (non-bloquante)
  if (db) {
    db.from("sms_logs")
      .insert({ id: `otp_${now}`, phone: normalized, type: "otp_4", status: "sent", created_at: nowIso() })
      .catch(() => {});
  }

  const message    = `Sungku : votre code est ${code}. Valide 5 min. Ne le partagez jamais.`;
  const smsResult  = await sendSms(normalized, message);

  return res.json({
    success:   true,
    message:   `Code envoyé au ${normalized}`,
    provider:  smsResult.provider,
    expiresIn: 300,
    // En simulation dev, on renvoie le code pour faciliter le test
    ...(smsResult.provider === "simulation" && process.env.NODE_ENV !== "production"
      ? { devCode: code }
      : {}),
  });
});

/**
 * POST /api/otp/verify
 * Body: { phone: "6XXXXXXXX", code: "1234", userId?: string }
 */
router.post("/verify", async (req, res) => {
  const { phone, code, userId } = req.body || {};
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: "phone et code requis" });
  }

  const normalized = normalizePhone(phone);
  if (!normalized) {
    return res.status(400).json({ success: false, message: "Numéro invalide" });
  }

  const store  = readOtpStore();
  const record = store[normalized];

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "Aucun code envoyé à ce numéro. Demandez un nouveau code.",
    });
  }

  if (Date.now() > record.expiresAt) {
    delete store[normalized];
    writeOtpStore(store);
    return res.status(400).json({ success: false, message: "Code expiré. Demandez un nouveau code." });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    delete store[normalized];
    writeOtpStore(store);
    return res.status(400).json({
      success: false,
      message: "Trop de tentatives incorrectes. Demandez un nouveau code.",
    });
  }

  const inputHash = hashCode(String(code).trim());
  if (inputHash !== record.hash) {
    record.attempts += 1;
    store[normalized] = record;
    writeOtpStore(store);
    const remaining = MAX_ATTEMPTS - record.attempts;
    return res.status(400).json({
      success: false,
      message: `Code incorrect. ${remaining} tentative(s) restante(s).`,
    });
  }

  // ✓ Code valide — nettoyage
  delete store[normalized];
  writeOtpStore(store);

  // Marquer l'utilisateur comme vérifié si userId fourni
  if (userId) {
    const now = nowIso();
    if (db) {
      db.from("users")
        .update({ verified: true, otp: null, updated_at: now })
        .eq("user_id", userId)
        .catch(() => {});
    }
    const users = readCollection("users.json", {});
    if (users[userId]) {
      users[userId].verified  = true;
      users[userId].otp       = null;
      users[userId].updatedAt = now;
      writeCollection("users.json", users);
    }
  }

  const token = userId ? createToken(userId) : null;

  return res.json({
    success:  true,
    message:  "Code vérifié avec succès",
    verified: true,
    ...(token  ? { token }  : {}),
    ...(userId ? { userId } : {}),
  });
});

export default router;
