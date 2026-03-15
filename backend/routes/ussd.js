import express from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = express.Router();

function generateUSSDCode(operator, phoneNumber, amount) {
  if (operator === "orange") return `#150*1*1*1*${phoneNumber}*${amount}#`;
  if (operator === "mtn")    return `*126*1*1*${phoneNumber}*${amount}#`;
  return "";
}
function generateTransactionId() { return `TXN_${Date.now()}`; }

router.post("/initiate", async (req, res) => {
  const { phoneNumber, operator, amount, description, userId } = req.body;
  if (!phoneNumber || !operator || !amount) return res.status(400).json({ success: false, message: "phoneNumber, operator, and amount are required" });
  if (!["orange", "mtn"].includes(operator)) return res.status(400).json({ success: false, message: "Invalid operator. Use 'orange' or 'mtn'" });
  if (amount < 1000 || amount > 1000000) return res.status(400).json({ success: false, message: "Amount must be between 1,000 and 1,000,000 FCFA" });

  const transactionId = generateTransactionId();
  const code          = generateUSSDCode(operator, phoneNumber, amount);
  const now           = nowIso();
  const expiresAt     = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const txn = { transactionId, phoneNumber, operator, amount, description: description || "payment", userId: userId || "anonymous", code, status: "pending", initiatedAt: now, expiresAt, completedAt: null };

  if (db) {
    const { error } = await db.from("ussd_transactions").insert({ transaction_id: transactionId, phone_number: phoneNumber, operator, amount, description: txn.description, user_id: txn.userId, code, status: "pending", initiated_at: now, expires_at: expiresAt });
    if (error) {
      console.error("Supabase ussd:", error.message);
    }
  }
  const store = readCollection("ussd-transactions.json", {});
  store[transactionId] = txn;
  writeCollection("ussd-transactions.json", store);

  res.json({ success: true, transactionId, message: "USSD initié", operator, phoneNumber, amount, code, timestamp: now });
});

router.get("/status/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  let txn;
  if (db) {
    const { data } = await db.from("ussd_transactions").select("*").eq("transaction_id", transactionId).maybeSingle();
    if (data) txn = { status: data.status, operator: data.operator, phoneNumber: data.phone_number, amount: data.amount, completedAt: data.completed_at, initiatedAt: data.initiated_at };
  }
  if (!txn) {
    const store = readCollection("ussd-transactions.json", {});
    txn = store[transactionId];
  }
  if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });
  res.json({ success: true, transactionId, status: txn.status, operator: txn.operator, phoneNumber: txn.phoneNumber, amount: txn.amount, timestamp: txn.completedAt || txn.initiatedAt });
});

router.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  if (db) {
    const { data } = await db.from("ussd_transactions").select("*").eq("user_id", userId).order("initiated_at", { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
    if (data) return res.json({ success: true, transactions: data, total: data.length, limit: Number(limit), offset: Number(offset) });
  }
  const store = readCollection("ussd-transactions.json", {});
  const txns  = Object.values(store).filter(t => t.userId === userId).sort((a,b) => new Date(b.initiatedAt)-new Date(a.initiatedAt)).slice(Number(offset), Number(offset)+Number(limit));
  res.json({ success: true, transactions: txns, total: txns.length, limit: Number(limit), offset: Number(offset) });
});

router.post("/cancel/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const now = nowIso();
  if (db) {
    await db.from("ussd_transactions").update({ status: "cancelled", completed_at: now }).eq("transaction_id", transactionId);
  }
  const store = readCollection("ussd-transactions.json", {});
  if (!store[transactionId]) return res.status(404).json({ success: false, message: "Transaction not found" });
  if (store[transactionId].status !== "pending") return res.status(400).json({ success: false, message: "Can only cancel pending transactions" });
  store[transactionId].status = "cancelled";
  store[transactionId].completedAt = now;
  writeCollection("ussd-transactions.json", store);
  res.json({ success: true, message: "Transaction annulée", transactionId });
});

router.post("/simulate-success/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { userId } = req.body;
  const now = nowIso();
  if (db) {
    await db.from("ussd_transactions").update({ status: "completed", completed_at: now }).eq("transaction_id", transactionId);
  }
  const store = readCollection("ussd-transactions.json", {});
  const txn   = store[transactionId];
  if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });
  txn.status = "completed"; txn.completedAt = now;
  writeCollection("ussd-transactions.json", store);
  const uid = userId || txn.userId;
  if (uid) {
    const stats = readCollection("profile-stats.json", {});
    if (!stats[uid]) stats[uid] = { userId: uid, transfers: 0, contacts: 0, miniApps: 0, balance: 0 };
    stats[uid].transfers = (stats[uid].transfers || 0) + 1;
    stats[uid].updatedAt = now;
    writeCollection("profile-stats.json", stats);
    if (db) {
      await db.from("profile_stats").upsert({ user_id: uid, transfers: stats[uid].transfers, updated_at: now }, { onConflict: "user_id" });
    }
  }
  res.json({ success: true, message: "Transaction simulée complète", transactionId, status: "completed" });
});

router.post("/simulate-failure/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { reason = "Solde insuffisant" } = req.body;
  const now = nowIso();
  if (db) {
    await db.from("ussd_transactions").update({ status: "failed", failure_reason: reason, completed_at: now }).eq("transaction_id", transactionId);
  }
  const store = readCollection("ussd-transactions.json", {});
  if (!store[transactionId]) return res.status(404).json({ success: false, message: "Transaction not found" });
  store[transactionId].status = "failed"; store[transactionId].failureReason = reason; store[transactionId].completedAt = now;
  writeCollection("ussd-transactions.json", store);
  res.json({ success: false, message: reason, transactionId, status: "failed" });
});

// Confirm transaction outcome from app after user validates USSD flow
router.post("/confirm/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { success, reason = "Échec de validation USSD", userId } = req.body || {};
  const now = nowIso();
  const nextStatus = success ? "completed" : "failed";

  if (db) {
    const payload = success
      ? { status: "completed", completed_at: now }
      : { status: "failed", failure_reason: reason, completed_at: now };
    await db.from("ussd_transactions").update(payload).eq("transaction_id", transactionId);
  }

  const store = readCollection("ussd-transactions.json", {});
  const txn = store[transactionId];
  if (!txn) {
    return res.status(404).json({ success: false, message: "Transaction not found" });
  }

  txn.status = nextStatus;
  txn.completedAt = now;
  if (!success) txn.failureReason = reason;
  writeCollection("ussd-transactions.json", store);

  if (success) {
    const uid = userId || txn.userId;
    if (uid) {
      const stats = readCollection("profile-stats.json", {});
      if (!stats[uid]) stats[uid] = { userId: uid, transfers: 0, contacts: 0, miniApps: 0, balance: 0 };
      stats[uid].transfers = (stats[uid].transfers || 0) + 1;
      stats[uid].updatedAt = now;
      writeCollection("profile-stats.json", stats);
      if (db) {
        await db.from("profile_stats").upsert({ user_id: uid, transfers: stats[uid].transfers, updated_at: now }, { onConflict: "user_id" });
      }
    }
  }

  return res.json({
    success: Boolean(success),
    transactionId,
    status: nextStatus,
    message: success ? "Transaction confirmée" : reason
  });
});

export default router;
