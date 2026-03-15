import { Router } from "express";
import { nowIso, readCollection, writeCollection } from "../lib/store.js";
import db from "../lib/db.js";
import { verifyNotchPaySignature } from "../lib/notchpay.js";

const router = Router();
const NOTCHPAY_BASE_URL = "https://api.notchpay.co";

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------

function getPublicKey() {
  return process.env.NOTCHPAY_PUBLIC_KEY || "";
}

function getPrivateKey() {
  return process.env.NOTCHPAY_PRIVATE_KEY || "";
}

function isConfigured() {
  return Boolean(getPublicKey() && getPrivateKey());
}

function authHeaders() {
  return {
    "Authorization": getPublicKey(),
    "X-Grant": getPrivateKey(),
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "SungkuSuperApp/1.0",
  };
}

// ---------------------------------------------------------------------------
// JSON file store helpers
// ---------------------------------------------------------------------------

function readStore() {
  return readCollection("notchpay-transfers.json", { transfers: {} });
}

function writeStore(store) {
  writeCollection("notchpay-transfers.json", store);
}

// ---------------------------------------------------------------------------
// Status normalisation
// ---------------------------------------------------------------------------

function normalizeStatus(value) {
  const s = String(value || "").toLowerCase();
  if (["complete", "completed", "success", "successful"].includes(s)) return "completed";
  if (["failed", "failure", "cancelled", "canceled"].includes(s)) return "failed";
  if (["processing"].includes(s)) return "processing";
  return "pending";
}

// ---------------------------------------------------------------------------
// Profile stats update on completion
// ---------------------------------------------------------------------------

function upsertProfileTransaction(userId, transfer) {
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
  const exists = transactions.some((t) => t.id === transfer.id);
  statsStore[userId] = {
    ...current,
    transfers: Number(current.transfers || 0) + (exists ? 0 : 1),
    transactions: exists ? transactions : [transfer, ...transactions].slice(0, 25),
    updatedAt: nowIso(),
  };
  writeCollection("profile-stats.json", statsStore);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** Check if NotchPay keys are configured. */
router.get("/config", (_req, res) => {
  res.json({
    configured: isConfigured(),
    provider: "notchpay",
    channels: ["cm.mtn", "cm.orange", "cm.mobile_money"],
  });
});

/**
 * Initiate a transfer.
 * Body: { amount, currency?, beneficiary_data: { name, phone, email? }, channel, description?, reference?, userId? }
 */
router.post("/send", async (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay n'est pas configuré sur le backend. Ajoutez NOTCHPAY_PUBLIC_KEY et NOTCHPAY_PRIVATE_KEY dans les variables d'environnement." });
  }

  const {
    amount,
    currency = "XAF",
    beneficiary,
    beneficiary_data,
    channel,
    description,
    reference,
    metadata,
    userId,
  } = req.body || {};

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Montant invalide" });
  }
  if (!channel) {
    return res.status(400).json({ success: false, message: "Le canal de paiement est requis (ex: cm.mtn, cm.orange)" });
  }
  const normalizedBeneficiary = beneficiary || (beneficiary_data
    ? {
        name: beneficiary_data.name,
        phone: beneficiary_data.phone,
        account_number: beneficiary_data.phone,
        channel,
        country: "CM",
        currency,
        type: "mobile_money",
        ...(beneficiary_data.email ? { email: beneficiary_data.email } : {}),
      }
    : null);

  if (!normalizedBeneficiary) {
    return res.status(400).json({ success: false, message: "beneficiary ou beneficiary_data est requis" });
  }

  const transferRef = reference || `TRF_${Date.now()}`;

  const payload = {
    amount: Number(amount),
    currency,
    channel,
    description: description || "Transfert Sungku",
    reference: transferRef,
    beneficiary: normalizedBeneficiary,
    ...(metadata ? { metadata } : {}),
  };

  try {
    const response = await fetch(`${NOTCHPAY_BASE_URL}/transfers`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { message: raw || "Reponse NotchPay non JSON" };
    }
    const transfer = data?.transfer || {};
    const status = normalizeStatus(transfer.status || data?.status);

    const localRecord = {
      id: transfer.id || transferRef,
      reference: transferRef,
      providerRef: transfer.reference || null,
      provider: "notchpay",
      amount: Number(amount),
      currency,
      channel,
      description: payload.description,
      userId: userId || "anonymous",
      beneficiary: transfer.beneficiary || null,
      beneficiaryData: beneficiary_data || null,
      status,
      providerStatus: transfer.status || null,
      createdAt: transfer.created_at || nowIso(),
      completedAt: transfer.completed_at || null,
      payload: data,
    };

    const store = readStore();
    store.transfers[transferRef] = localRecord;
    writeStore(store);

    if (db && localRecord.id) {
      try {
        await db.from("ussd_transactions").insert({
          transaction_id: transferRef,
          phone_number: beneficiary_data?.phone || String(beneficiary || "notchpay"),
          operator: channel,
          amount: localRecord.amount,
          description: localRecord.description,
          user_id: localRecord.userId,
          code: transfer.id || transferRef,
          status: localRecord.status,
          initiated_at: localRecord.createdAt,
          expires_at: null,
        });
      } catch {
        // Local transfer flow should continue even if DB mirror insert fails.
      }
    }

    if (!response.ok) {
      return res.status(response.status >= 500 ? 502 : response.status).json({
        success: false,
        reference: transferRef,
        status: "failed",
        message: data?.message || `Erreur NotchPay ${response.status}`,
        errors: data?.errors || null,
        payload: data,
      });
    }

    return res.status(201).json({
      success: true,
      reference: transferRef,
      transferId: transfer.id,
      status,
      message: data?.message || "Transfert initié",
      transfer: localRecord,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? `NotchPay indisponible: ${error.message}` : "NotchPay indisponible",
    });
  }
});

/**
 * Check the status of a transfer by its reference or NotchPay ID.
 */
router.get("/check/:ref", async (req, res) => {
  const { ref } = req.params;
  if (!isConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configuré" });
  }

  try {
    const response = await fetch(`${NOTCHPAY_BASE_URL}/transfers/${encodeURIComponent(ref)}`, {
      headers: authHeaders(),
    });

    const data = await response.json();
    const transfer = data?.transfer || {};
    const status = normalizeStatus(transfer.status || data?.status);

    const store = readStore();
    const previous = store.transfers[ref] || {};
    const updated = {
      ...previous,
      id: transfer.id || previous.id || ref,
      reference: transfer.reference || previous.reference || ref,
      status,
      providerStatus: transfer.status || null,
      completedAt: transfer.completed_at || previous.completedAt || null,
      updatedAt: nowIso(),
      payload: data,
    };
    store.transfers[ref] = updated;
    writeStore(store);

    if (status === "completed" && !previous.completedAt) {
      upsertProfileTransaction(previous.userId || "anonymous", {
        id: updated.id,
        type: "transfer",
        recipient: updated.beneficiaryData?.phone || String(updated.beneficiary || "NotchPay"),
        amount: updated.amount,
        timestamp: updated.completedAt || nowIso(),
        status: "completed",
        provider: "notchpay",
      });

      if (db) {
        try {
          await db.from("ussd_transactions")
            .update({ status: "completed", completed_at: updated.completedAt || nowIso() })
            .eq("transaction_id", ref);
        } catch {
          // Ignore mirror update failures to avoid breaking status checks.
        }
      }
    }

    return res.json({
      success: response.ok,
      reference: ref,
      transferId: transfer.id,
      status,
      providerStatus: transfer.status,
      message: data?.message || "Statut récupéré",
      transfer: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Erreur vérification NotchPay",
    });
  }
});

/**
 * Cancel a pending transfer.
 */
router.delete("/cancel/:ref", async (req, res) => {
  const { ref } = req.params;
  if (!isConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configuré" });
  }

  try {
    const response = await fetch(`${NOTCHPAY_BASE_URL}/transfers/${encodeURIComponent(ref)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await response.json();

    if (response.ok) {
      const store = readStore();
      if (store.transfers[ref]) {
        store.transfers[ref].status = "canceled";
        store.transfers[ref].updatedAt = nowIso();
        writeStore(store);
      }
    }

    return res.status(response.ok ? 200 : response.status >= 500 ? 502 : response.status).json({
      success: response.ok,
      reference: ref,
      message: data?.message || "Transfert annulé",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Erreur annulation NotchPay",
    });
  }
});

/**
 * List stored transfers for a given userId (local store).
 */
router.get("/history/:userId", (req, res) => {
  const { userId } = req.params;
  const store = readStore();
  const items = Object.values(store.transfers)
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30);
  res.json({ success: true, transfers: items, total: items.length });
});

/**
 * Webhook endpoint for NotchPay transfer events.
 */
router.post("/webhook", async (req, res) => {
  const signature = verifyNotchPaySignature(req);
  if (!signature.ok) {
    return res.status(401).json({ success: false, message: "Signature webhook NotchPay invalide", reason: signature.reason });
  }

  const event = req.body;
  const eventType = event?.type || "";

  if (eventType.startsWith("transfer.")) {
    const transfer = event?.data || {};
    const ref = transfer.reference || transfer.id;
    if (ref) {
      const status = normalizeStatus(transfer.status);
      const store = readStore();
      const previous = store.transfers[ref] || {};
      store.transfers[ref] = {
        ...previous,
        id: transfer.id || previous.id,
        status,
        providerStatus: transfer.status,
        completedAt: transfer.completed_at || previous.completedAt || null,
        updatedAt: nowIso(),
      };
      writeStore(store);

      if (status === "completed" && previous.userId && !previous.completedAt) {
        upsertProfileTransaction(previous.userId, {
          id: transfer.id || ref,
          type: "transfer",
          recipient: previous.beneficiaryData?.phone || String(previous.beneficiary || ""),
          amount: previous.amount || transfer.amount,
          timestamp: transfer.completed_at || nowIso(),
          status: "completed",
          provider: "notchpay",
        });
      }
    }
  }

  res.json({ success: true });
});

export default router;
