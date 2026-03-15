import express from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = express.Router();

const BASE = () =>
  (process.env.CAMPAY_BASE_URL || "https://demo.campay.net").replace(/\/$/, "");

function minAmountXaf() {
  return BASE().includes("demo.campay.net") ? 1 : 100;
}

const CAMPAY_ERROR_MESSAGES = {
  ER101: "Numéro invalide",
  ER102: "Opérateur non supporté",
  ER201: "Montant décimal interdit",
  ER301: "Solde insuffisant",
};

function mapCamPayError(data) {
  const code = data?.error_code || data?.code || null;
  const message =
    (code && CAMPAY_ERROR_MESSAGES[code]) ||
    data?.detail ||
    data?.message ||
    "Erreur CamPay";
  return { code, message };
}

function normalizeCameroonPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("237") && digits.length === 12) return digits;
  if (digits.startsWith("6") && digits.length === 9) return `237${digits}`;
  return null;
}

function detectOperator(phone237) {
  if (!phone237) return "UNKNOWN";
  const local = String(phone237).slice(3);
  const p3 = Number(local.slice(0, 3));

  if ((p3 >= 655 && p3 <= 657) || (p3 >= 690 && p3 <= 699)) return "ORANGE";
  if ((p3 >= 650 && p3 <= 659) || (p3 >= 670 && p3 <= 679)) return "MTN";
  if (local.startsWith("242")) return "YOOMEE";
  if (local.startsWith("233")) return "BLUE";
  return "UNKNOWN";
}

function normalizeStatus(status) {
  const s = String(status || "").toUpperCase();
  if (["SUCCESSFUL", "SUCCESS", "COMPLETED", "COMPLETE"].includes(s)) return "SUCCESSFUL";
  if (["FAILED", "FAILURE", "CANCELLED", "CANCELED", "REFUSED"].includes(s)) return "FAILED";
  return "PENDING";
}

// ─── Token cache ──────────────────────────────────────────────────────────────
let _token = null;
let _tokenExpiry = 0;

async function getToken() {
  const now = Date.now();
  if (_token && now < _tokenExpiry) return _token;

  const username = process.env.CAMPAY_USERNAME;
  const password = process.env.CAMPAY_PASSWORD;
  if (!username || !password)
    throw new Error("CAMPAY_USERNAME / CAMPAY_PASSWORD non configurés dans .env");

  const res = await fetch(`${BASE()}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`CamPay auth failed (HTTP ${res.status})`);

  const json = await res.json();
  _token = json.token;
  _tokenExpiry = now + ((json.expires_in || 3600) - 60) * 1000;
  return _token;
}

// ─── Persist transaction ───────────────────────────────────────────────────────
function saveTx(tx) {
  const list = readCollection("campay-transactions.json", []);
  const idx = list.findIndex((t) => t.id === tx.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...tx, updated_at: nowIso() };
  } else {
    list.unshift({ ...tx, created_at: nowIso(), updated_at: nowIso() });
  }
  writeCollection("campay-transactions.json", list);
}

// ─── POST /api/campay/collect ─────────────────────────────────────────────────
// Initie un transfert Mobile Money ; l'utilisateur reçoit un prompt USSD pour saisir son PIN
router.post("/collect", async (req, res) => {
  try {
    const { amount, from, to, description, external_reference, userId } = req.body;
    const amt = parseInt(amount);
    const normalizedFrom = normalizeCameroonPhone(from);
    const normalizedTo = to ? normalizeCameroonPhone(to) : normalizedFrom;
    const fromOperator = detectOperator(normalizedFrom);
    const toOperator = detectOperator(normalizedTo);

    const min = minAmountXaf();
    if (!normalizedFrom || isNaN(amt) || amt < min) {
      return res
        .status(400)
        .json({
          success: false,
          code: "ER101",
          message: `Paramètres invalides (from requis, montant ≥ ${min} XAF)`,
        });
    }

    // Sungku Send transferts: MTN / ORANGE uniquement
    if (!["MTN", "ORANGE"].includes(fromOperator) || !["MTN", "ORANGE"].includes(toOperator)) {
      return res.status(400).json({
        success: false,
        code: "ER102",
        message: "Opérateur non supporté pour transfert (MTN/ORANGE uniquement)",
      });
    }

    const token = await getToken();
    const ref = external_reference || `SKS-${Date.now()}`;

    const upstream = await fetch(`${BASE()}/api/collect/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      body: JSON.stringify({
        amount: amt,
        currency: "XAF",
        from: normalizedFrom,
        description: description || "Sungku Send",
        external_reference: ref,
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      const mapped = mapCamPayError(data);
      return res.status(upstream.status).json({
        success: false,
        message: mapped.message,
        code: mapped.code,
      });
    }

    saveTx({
      id: data.reference,
      external_ref: ref,
      user_id: userId || "unknown",
      type: "TRANSFER",
      amount: amt,
      currency: "XAF",
      from_number: normalizedFrom,
      to_number: normalizedTo,
      from_operator: fromOperator,
      to_operator: toOperator,
      description: description || "Sungku Send",
      status: "PENDING",
    });

    return res.json({
      success: true,
      reference: data.reference,
      from_operator: fromOperator,
      to_operator: toOperator,
      status: "PENDING",
    });
  } catch (err) {
    console.error("[campay:collect]", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/campay/transaction/:ref ─────────────────────────────────────────
// Polling statut — appelé toutes les 3s côté frontend
router.get("/transaction/:ref", async (req, res) => {
  try {
    const token = await getToken();
    const upstream = await fetch(`${BASE()}/api/transaction/${req.params.ref}/`, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await upstream.json();

    const normalizedStatus = normalizeStatus(data.status);

    // Sync local record
    saveTx({ id: req.params.ref, status: normalizedStatus });

    return res.json({
      success: true,
      status: normalizedStatus,
      reference: req.params.ref,
      data,
    });
  } catch (err) {
    console.error("[campay:transaction]", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/campay/airtime ─────────────────────────────────────────────────
// Recharge crédit — MTN, Orange, Yoomee, Blue
router.post("/airtime", async (req, res) => {
  try {
    const { amount, to, from, description, external_reference, userId } = req.body;
    const amt = parseInt(amount);
    const normalizedTo = normalizeCameroonPhone(to);
    const normalizedFrom = from ? normalizeCameroonPhone(from) : normalizedTo;
    const toOperator = detectOperator(normalizedTo);

    const min = minAmountXaf();
    if (!normalizedTo || isNaN(amt) || amt < min) {
      return res
        .status(400)
        .json({
          success: false,
          code: "ER101",
          message: `Paramètres invalides (to requis, montant ≥ ${min} XAF)`,
        });
    }

    if (toOperator === "UNKNOWN") {
      return res.status(400).json({
        success: false,
        code: "ER102",
        message: "Opérateur non supporté pour recharge",
      });
    }

    const token = await getToken();
    const ref = external_reference || `SKA-${Date.now()}`;

    const upstream = await fetch(`${BASE()}/api/utilities/airtime/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      body: JSON.stringify({
        amount: amt,
        currency: "XAF",
        to: normalizedTo,
        description: description || "Recharge Sungku",
        external_reference: ref,
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      const mapped = mapCamPayError(data);
      return res.status(upstream.status).json({
        success: false,
        message: mapped.message,
        code: mapped.code,
      });
    }

    saveTx({
      id: data.reference,
      external_ref: ref,
      user_id: userId || "unknown",
      type: "AIRTIME",
      amount: amt,
      currency: "XAF",
      from_number: normalizedFrom,
      to_number: normalizedTo,
      to_operator: toOperator,
      description: description || "Recharge Sungku",
      status: "PENDING",
    });

    return res.json({
      success: true,
      reference: data.reference,
      to_operator: toOperator,
      status: "PENDING",
    });
  } catch (err) {
    console.error("[campay:airtime]", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/campay/balance ──────────────────────────────────────────────────
// Solde de l'application CamPay (admin seulement)
router.get("/balance", async (_req, res) => {
  try {
    const token = await getToken();
    const upstream = await fetch(`${BASE()}/api/get_application_balance/`, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await upstream.json();
    return res.json({ success: true, balance: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/campay/history/:userId ─────────────────────────────────────────
// Historique local des transactions (30 par page, filtrable)
router.get("/history/:userId", (req, res) => {
  const { userId } = req.params;
  const { type, status, page = "1", limit = "30" } = req.query;

  let list = readCollection("campay-transactions.json", []).filter(
    (t) => t.user_id === userId
  );

  if (type) list = list.filter((t) => t.type === String(type).toUpperCase());
  if (status) list = list.filter((t) => t.status === String(status).toUpperCase());

  const start = (Number(page) - 1) * Number(limit);
  return res.json({
    success: true,
    transactions: list.slice(start, start + Number(limit)),
    total: list.length,
  });
});

export default router;
