import express from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = express.Router();

// Helper to generate USSD code
function generateUSSDCode(operator, phoneNumber, amount) {
  if (operator === "orange") {
    return `#150*1*1*1*${phoneNumber}*${amount}#`;
  } else if (operator === "mtn") {
    return `*126*1*1*${phoneNumber}*${amount}#`;
  }
  return "";
}

// Helper to generate transaction ID
function generateTransactionId() {
  return `TXN_${Date.now()}`;
}

// Initiate USSD transaction
router.post("/initiate", (req, res) => {
  const { phoneNumber, operator, amount, description, userId } = req.body;

  // Validation
  if (!phoneNumber || !operator || !amount) {
    return res.status(400).json({
      success: false,
      message: "phoneNumber, operator, and amount are required"
    });
  }

  if (!["orange", "mtn"].includes(operator)) {
    return res.status(400).json({
      success: false,
      message: "Invalid operator. Use 'orange' or 'mtn'"
    });
  }

  if (amount < 1000 || amount > 1000000) {
    return res.status(400).json({
      success: false,
      message: "Amount must be between 1,000 and 1,000,000 FCFA"
    });
  }

  const transactionId = generateTransactionId();
  const ussdCode = generateUSSDCode(operator, phoneNumber, amount);

  // Store transaction
  const ussdStore = readCollection("ussd-transactions.json", {});
  ussdStore[transactionId] = {
    transactionId,
    phoneNumber,
    operator,
    amount,
    description: description || "payment",
    userId: userId || "anonymous",
    code: ussdCode,
    status: "pending",
    initiatedAt: nowIso(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry
    completedAt: null
  };
  writeCollection("ussd-transactions.json", ussdStore);

  res.json({
    success: true,
    transactionId,
    message: "USSD initié",
    operator,
    phoneNumber,
    amount,
    code: ussdCode,
    timestamp: nowIso()
  });
});

// Check USSD transaction status
router.get("/status/:transactionId", (req, res) => {
  const { transactionId } = req.params;

  const ussdStore = readCollection("ussd-transactions.json", {});
  const transaction = ussdStore[transactionId];

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found"
    });
  }

  res.json({
    success: true,
    transactionId,
    status: transaction.status,
    message: transaction.status === "completed" 
      ? "Transaction réussie" 
      : transaction.status === "failed"
      ? "Transaction échouée"
      : "En attente de confirmation",
    operator: transaction.operator,
    phoneNumber: transaction.phoneNumber,
    amount: transaction.amount,
    timestamp: transaction.completedAt || transaction.initiatedAt
  });
});

// Get USSD history for a user
router.get("/history/:userId", (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  const ussdStore = readCollection("ussd-transactions.json", {});
  const userTransactions = Object.values(ussdStore)
    .filter(t => t.userId === userId || userId === "all")
    .sort((a, b) => new Date(b.initiatedAt) - new Date(a.initiatedAt))
    .slice(Number(offset), Number(offset) + Number(limit));

  res.json({
    success: true,
    transactions: userTransactions,
    total: Object.values(ussdStore).filter(t => t.userId === userId).length,
    limit: Number(limit),
    offset: Number(offset)
  });
});

// Cancel USSD transaction
router.post("/cancel/:transactionId", (req, res) => {
  const { transactionId } = req.params;

  const ussdStore = readCollection("ussd-transactions.json", {});
  const transaction = ussdStore[transactionId];

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found"
    });
  }

  if (transaction.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Can only cancel pending transactions"
    });
  }

  transaction.status = "cancelled";
  transaction.completedAt = nowIso();
  writeCollection("ussd-transactions.json", ussdStore);

  res.json({
    success: true,
    message: "Transaction annulée",
    transactionId
  });
});

// Simulate successful USSD response (for testing)
router.post("/simulate-success/:transactionId", (req, res) => {
  const { transactionId } = req.params;
  const { userId } = req.body;

  const ussdStore = readCollection("ussd-transactions.json", {});
  const transaction = ussdStore[transactionId];

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found"
    });
  }

  transaction.status = "completed";
  transaction.completedAt = nowIso();
  writeCollection("ussd-transactions.json", ussdStore);

  // Update user profile stats if userId provided
  if (userId || transaction.userId) {
    const uid = userId || transaction.userId;
    const statsStore = readCollection("profile-stats.json", {});
    
    if (!statsStore[uid]) {
      statsStore[uid] = {
        userId: uid,
        transfers: 0,
        contacts: 0,
        miniApps: 1,
        balance: 0,
        transactions: []
      };
    }

    // Add to transfers count
    statsStore[uid].transfers = (statsStore[uid].transfers || 0) + 1;
    
    // Add to transactions array
    if (!statsStore[uid].transactions) {
      statsStore[uid].transactions = [];
    }
    
    statsStore[uid].transactions.push({
      id: transactionId,
      type: "transfer",
      amount: transaction.amount,
      recipient: transaction.phoneNumber,
      operator: transaction.operator,
      status: "completed",
      timestamp: transaction.completedAt
    });

    // Limit transactions to last 50
    if (statsStore[uid].transactions.length > 50) {
      statsStore[uid].transactions = statsStore[uid].transactions.slice(-50);
    }

    statsStore[uid].updatedAt = nowIso();
    writeCollection("profile-stats.json", statsStore);
  }

  res.json({
    success: true,
    message: "Transaction simulée complète",
    transactionId,
    status: "completed"
  });
});

// Simulate failed USSD response (for testing)
router.post("/simulate-failure/:transactionId", (req, res) => {
  const { transactionId } = req.params;
  const { reason = "Solde insuffisant" } = req.body;

  const ussdStore = readCollection("ussd-transactions.json", {});
  const transaction = ussdStore[transactionId];

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found"
    });
  }

  transaction.status = "failed";
  transaction.failureReason = reason;
  transaction.completedAt = nowIso();
  writeCollection("ussd-transactions.json", ussdStore);

  res.json({
    success: false,
    message: reason,
    transactionId,
    status: "failed"
  });
});

export default router;
