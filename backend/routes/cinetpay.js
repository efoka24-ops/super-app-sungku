import { Router } from "express";
import { nowIso, readCollection, writeCollection } from "../lib/store.js";
import db from "../lib/db.js";

const router = Router();
const CINETPAY_PAYMENT_URL = "https://api-checkout.cinetpay.com/v2/payment";
const CINETPAY_CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check";
const CINETPAY_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "User-Agent": "SungkuSuperApp/1.0",
};

function hasCinetPayConfig() {
  return Boolean(process.env.CINETPAY_API_KEY && process.env.CINETPAY_SITE_ID);
}

function sanitizeDescription(value) {
  return String(value || "Paiement Sungku")
    .replace(/[#$\/_&]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function normalizeAmount(value) {
  return Math.round(Number(value || 0));
}

function getBackendPublicUrl(req) {
  return (
    process.env.BACKEND_PUBLIC_URL ||
    `${req.protocol}://${req.get("host")}`
  ).replace(/\/$/, "");
}

function getTransactionsStore() {
  return readCollection("cinetpay-transactions.json", {});
}

function writeTransactionsStore(store) {
  writeCollection("cinetpay-transactions.json", store);
}

function mapProviderStatus(status) {
  const value = String(status || "").toUpperCase();
  if (["ACCEPTED", "SUCCESS", "COMPLETED", "00"].includes(value)) return "completed";
  if (["REFUSED", "FAILED", "CANCELLED", "EXPIRED"].includes(value)) return "failed";
  return "pending";
}

function upsertProfileTransaction(userId, transaction) {
  if (!userId) return;

  const statsStore = readCollection("profile-stats.json", {});
  const current = statsStore[userId] || {
    userId,
    transfers: 0,
    contacts: 0,
    miniApps: 0,
    transactions: [],
    updatedAt: nowIso(),
  };

  const transactions = Array.isArray(current.transactions) ? current.transactions : [];
  const alreadyExists = transactions.some((entry) => entry.id === transaction.id);
  const nextTransactions = alreadyExists ? transactions : [transaction, ...transactions].slice(0, 25);

  statsStore[userId] = {
    ...current,
    transfers: Number(current.transfers || 0) + (alreadyExists ? 0 : 1),
    transactions: nextTransactions,
    updatedAt: nowIso(),
  };

  writeCollection("profile-stats.json", statsStore);
}

async function syncProviderTransaction(transactionId) {
  if (!hasCinetPayConfig()) {
    throw new Error("CINETPAY_NOT_CONFIGURED");
  }

  const response = await fetch(CINETPAY_CHECK_URL, {
    method: "POST",
    headers: CINETPAY_HEADERS,
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
    }),
  });

  const payload = await response.json();
  const providerData = payload?.data || {};
  const providerStatus = providerData.status || payload?.status || payload?.code;

  return {
    ok: response.ok,
    payload,
    providerStatus,
    normalizedStatus: mapProviderStatus(providerStatus),
  };
}

router.get("/config", (_req, res) => {
  res.json({
    configured: hasCinetPayConfig(),
    provider: "cinetpay",
    currency: process.env.CINETPAY_CURRENCY || "XAF",
    hasCallbackUrl: Boolean(process.env.BACKEND_PUBLIC_URL),
  });
});

router.post("/initiate", async (req, res) => {
  const {
    amount,
    description,
    userId,
    customerName,
    customerSurname,
    customerEmail,
    customerPhoneNumber,
    customerAddress,
    customerCity,
    customerCountry,
    customerState,
    customerZipCode,
    channels = "ALL",
    flowType = "send",
    recipient,
    metadata,
    currency = process.env.CINETPAY_CURRENCY || "XAF",
  } = req.body || {};

  const normalizedAmount = normalizeAmount(amount);

  if (!normalizedAmount || normalizedAmount <= 0) {
    return res.status(400).json({ success: false, message: "Montant invalide" });
  }

  if (String(currency).toUpperCase() !== "USD" && normalizedAmount % 5 !== 0) {
    return res.status(400).json({
      success: false,
      message: "Le montant CinetPay doit etre un multiple de 5",
    });
  }

  if (!hasCinetPayConfig()) {
    return res.status(503).json({
      success: false,
      message: "CinetPay n'est pas configuré sur le backend",
    });
  }

  const transactionId = `CP_${Date.now()}`;
  const now = nowIso();
  const backendPublicUrl = getBackendPublicUrl(req);

  const localTransaction = {
    id: transactionId,
    transactionId,
    provider: "cinetpay",
    amount: normalizedAmount,
    currency,
    description: sanitizeDescription(description),
    userId: userId || "anonymous",
    flowType,
    recipient: recipient || null,
    metadata: metadata || null,
    customerName: customerName || "Sungku",
    customerSurname: customerSurname || "User",
    customerEmail: customerEmail || "support@sungku.app",
    customerPhoneNumber: customerPhoneNumber || "",
    paymentUrl: null,
    paymentToken: null,
    providerStatus: "PENDING",
    status: "pending",
    createdAt: now,
    updatedAt: now,
    paidAt: null,
  };

  const payload = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: transactionId,
    amount: normalizedAmount,
    currency,
    description: localTransaction.description,
    return_url: `${backendPublicUrl}/api/cinetpay/return?transactionId=${transactionId}`,
    notify_url: `${backendPublicUrl}/api/cinetpay/notify`,
    channels,
    lang: "fr",
    customer_name: localTransaction.customerName,
    customer_surname: localTransaction.customerSurname,
    customer_email: localTransaction.customerEmail,
    customer_phone_number: localTransaction.customerPhoneNumber,
    customer_address: customerAddress || process.env.CINETPAY_DEFAULT_ADDRESS || "Sungku",
    customer_city: customerCity || process.env.CINETPAY_DEFAULT_CITY || "Douala",
    customer_country: customerCountry || process.env.CINETPAY_COUNTRY_CODE || "CM",
    customer_state: customerState || process.env.CINETPAY_COUNTRY_CODE || "CM",
    customer_zip_code: customerZipCode || process.env.CINETPAY_DEFAULT_ZIP_CODE || "00000",
    metadata: JSON.stringify({
      userId: localTransaction.userId,
      flowType,
      recipient,
      ...metadata,
    }),
  };

  try {
    const response = await fetch(CINETPAY_PAYMENT_URL, {
      method: "POST",
      headers: CINETPAY_HEADERS,
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    const paymentUrl = result?.data?.payment_url;
    const paymentToken = result?.data?.payment_token || null;

    if (!response.ok || !paymentUrl) {
      return res.status(502).json({
        success: false,
        message: result?.message || "Impossible d'initialiser le paiement CinetPay",
        raw: result,
      });
    }

    localTransaction.paymentUrl = paymentUrl;
    localTransaction.paymentToken = paymentToken;

    const store = getTransactionsStore();
    store[transactionId] = localTransaction;
    writeTransactionsStore(store);

    if (db) {
      await db.from("ussd_transactions").insert({
        transaction_id: transactionId,
        phone_number: localTransaction.customerPhoneNumber || recipient || "cinetpay",
        operator: "cinetpay",
        amount: localTransaction.amount,
        description: localTransaction.description,
        user_id: localTransaction.userId,
        code: paymentToken || paymentUrl,
        status: "pending",
        initiated_at: now,
        expires_at: null,
      });
    }

    return res.json({
      success: true,
      transactionId,
      paymentUrl,
      paymentToken,
      status: "pending",
      message: "Paiement CinetPay initialisé",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Erreur serveur CinetPay",
    });
  }
});

router.get("/check/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const store = getTransactionsStore();
  const current = store[transactionId];

  if (!current) {
    return res.status(404).json({ success: false, message: "Transaction introuvable" });
  }

  try {
    const checked = await syncProviderTransaction(transactionId);
    current.providerStatus = checked.providerStatus;
    current.status = checked.normalizedStatus;
    current.updatedAt = nowIso();

    if (checked.normalizedStatus === "completed" && !current.paidAt) {
      current.paidAt = nowIso();
      upsertProfileTransaction(current.userId, {
        id: current.transactionId,
        type: current.flowType === "receive" ? "receive" : "transfer",
        recipient: current.recipient || current.customerPhoneNumber || "CinetPay",
        amount: current.amount,
        timestamp: current.paidAt,
        status: "completed",
        provider: "cinetpay",
      });

      if (db) {
        await db.from("ussd_transactions").update({
          status: "completed",
          completed_at: current.paidAt,
        }).eq("transaction_id", transactionId);
      }
    }

    if (checked.normalizedStatus === "failed" && db) {
      await db.from("ussd_transactions").update({
        status: "failed",
        failure_reason: checked.payload?.message || "Paiement refuse",
        completed_at: nowIso(),
      }).eq("transaction_id", transactionId);
    }

    store[transactionId] = current;
    writeTransactionsStore(store);

    return res.json({
      success: checked.normalizedStatus === "completed",
      transactionId,
      status: current.status,
      providerStatus: current.providerStatus,
      message: checked.payload?.message || (current.status === "completed" ? "Paiement confirme" : "Paiement en attente"),
      transaction: current,
    });
  } catch (error) {
    const message = error instanceof Error && error.message === "CINETPAY_NOT_CONFIGURED"
      ? "CinetPay n'est pas configure sur le backend"
      : error instanceof Error
        ? error.message
        : "Erreur de verification CinetPay";

    return res.status(500).json({
      success: false,
      transactionId,
      status: current.status,
      message,
    });
  }
});

router.post("/notify", async (req, res) => {
  const transactionId = req.body?.transaction_id || req.query?.transaction_id;
  if (!transactionId) {
    return res.status(400).json({ success: false, message: "transaction_id requis" });
  }

  try {
    const checked = await syncProviderTransaction(String(transactionId));
    const store = getTransactionsStore();
    const current = store[transactionId];
    if (current) {
      current.providerStatus = checked.providerStatus;
      current.status = checked.normalizedStatus;
      current.updatedAt = nowIso();
      if (checked.normalizedStatus === "completed" && !current.paidAt) {
        current.paidAt = nowIso();
        upsertProfileTransaction(current.userId, {
          id: current.transactionId,
          type: current.flowType === "receive" ? "receive" : "transfer",
          recipient: current.recipient || current.customerPhoneNumber || "CinetPay",
          amount: current.amount,
          timestamp: current.paidAt,
          status: "completed",
          provider: "cinetpay",
        });
      }
      store[transactionId] = current;
      writeTransactionsStore(store);
    }
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, message: "Notification CinetPay invalide" });
  }
});

router.get("/return", (req, res) => {
  const transactionId = req.query?.transactionId || "";
  res.type("html").send(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Sungku Payment</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family: Arial, sans-serif; background:#f5f7f8; color:#111; padding:32px; text-align:center;"><div style="max-width:420px; margin:0 auto; background:#fff; border-radius:16px; padding:24px; box-shadow:0 10px 25px rgba(0,0,0,.08)"><h1 style="margin-top:0; color:#059669">Paiement CinetPay</h1><p>Le paiement pour la transaction <strong>${transactionId}</strong> a ete traite.</p><p>Retournez dans l'application Sungku pour verifier le statut.</p></div></body></html>`);
});

export default router;