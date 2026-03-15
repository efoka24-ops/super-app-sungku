import { Router } from "express";
import { nowIso, readCollection, writeCollection } from "../lib/store.js";
import { isNotchPayConfigured, requestNotchPay, verifyNotchPaySignature } from "../lib/notchpay.js";

const router = Router();

function normalizePaymentStatus(value) {
  const s = String(value || "").toLowerCase();
  if (["complete", "completed", "success"].includes(s)) return "completed";
  if (["failed", "cancelled", "canceled", "expired"].includes(s)) return "failed";
  if (s === "processing") return "processing";
  return "pending";
}

function readStore() {
  return readCollection("notchpay-payments.json", { items: {} });
}

function writeStore(store) {
  writeCollection("notchpay-payments.json", store);
}

function resolveProviderReference(reference, store) {
  const current = store.items?.[reference];
  return current?.providerReference || reference;
}

router.get("/config", (_req, res) => {
  res.json({ configured: isNotchPayConfigured(), provider: "notchpay-payments" });
});

router.get("/list", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }

  const query = new URLSearchParams(req.query || {}).toString();
  const path = query ? `/payments?${query}` : "/payments";
  const { response, data } = await requestNotchPay(path, { withGrant: false });

  return res.status(response.status).json({
    success: response.ok,
    message: data?.message || "Payments recuperees",
    payload: data,
  });
});

router.post("/create", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }

  const {
    amount,
    currency = "XAF",
    email,
    phone,
    customer,
    description,
    reference = `PAY_${Date.now()}`,
    callback,
    metadata,
    locked_channel,
    locked_country,
    locked_currency,
  } = req.body || {};

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Montant invalide" });
  }

  const payload = {
    amount: Number(amount),
    currency,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(customer ? { customer } : {}),
    ...(description ? { description } : {}),
    ...(callback ? { callback } : {}),
    ...(metadata ? { metadata } : {}),
    ...(locked_channel ? { locked_channel } : {}),
    ...(locked_country ? { locked_country } : {}),
    ...(locked_currency ? { locked_currency } : {}),
    reference,
  };

  const { response, data } = await requestNotchPay("/payments", {
    method: "POST",
    body: payload,
    withGrant: false,
  });

  const tx = data?.transaction || {};
  const providerReference = tx.reference || reference;
  const store = readStore();
  store.items[reference] = {
    id: tx.id || reference,
    reference,
    providerReference,
    amount: Number(amount),
    currency,
    status: normalizePaymentStatus(tx.status || data?.status),
    providerStatus: tx.status || null,
    authorizationUrl: data?.authorization_url || null,
    customer: tx.customer || null,
    description: payload.description || "",
    createdAt: tx.created_at || nowIso(),
    completedAt: tx.completed_at || null,
    payload: data,
  };
  writeStore(store);

  return res.status(response.status).json({
    success: response.ok,
    message: data?.message || "Paiement initialise",
    reference,
    status: store.items[reference].status,
    authorizationUrl: data?.authorization_url || null,
    payment: store.items[reference],
    payload: data,
  });
});

router.get("/check/:reference", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }

  const { reference } = req.params;
  const store = readStore();
  const providerReference = resolveProviderReference(reference, store);

  const { response, data } = await requestNotchPay(`/payments/${encodeURIComponent(providerReference)}`, {
    withGrant: false,
  });

  const tx = data?.transaction || {};
  const existing = store.items[reference] || {};
  store.items[reference] = {
    ...existing,
    id: tx.id || existing.id || reference,
    reference,
    providerReference: tx.reference || providerReference,
    status: normalizePaymentStatus(tx.status || data?.status),
    providerStatus: tx.status || null,
    completedAt: tx.completed_at || existing.completedAt || null,
    updatedAt: nowIso(),
    payload: data,
  };
  writeStore(store);

  return res.status(response.status).json({
    success: response.ok,
    message: data?.message || "Transaction recuperee",
    payment: store.items[reference],
    payload: data,
  });
});

router.post("/process/:reference", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }

  const { reference } = req.params;
  const { channel, data, client_ip } = req.body || {};
  if (!channel) {
    return res.status(400).json({ success: false, message: "channel requis" });
  }

  const store = readStore();
  const providerReference = resolveProviderReference(reference, store);

  const { response, data: payload } = await requestNotchPay(`/payments/${encodeURIComponent(providerReference)}`, {
    method: "POST",
    body: { channel, ...(data ? { data } : {}), ...(client_ip ? { client_ip } : {}) },
    withGrant: false,
  });

  return res.status(response.status).json({
    success: response.ok,
    message: payload?.message || "Traitement paiement lance",
    payload,
  });
});

router.delete("/cancel/:reference", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const { reference } = req.params;
  const store = readStore();
  const providerReference = resolveProviderReference(reference, store);

  const { response, data } = await requestNotchPay(`/payments/${encodeURIComponent(providerReference)}`, {
    method: "DELETE",
    withGrant: false,
  });

  if (store.items[reference]) {
    store.items[reference].status = "failed";
    store.items[reference].providerStatus = "canceled";
    store.items[reference].updatedAt = nowIso();
    writeStore(store);
  }

  return res.status(response.status).json({
    success: response.ok,
    message: data?.message || "Paiement annule",
    payload: data,
  });
});

router.post("/webhook", (req, res) => {
  const signature = verifyNotchPaySignature(req);
  if (!signature.ok) {
    return res.status(401).json({ success: false, message: "Signature webhook NotchPay invalide", reason: signature.reason });
  }

  const event = req.body || {};
  const type = String(event.type || "");
  if (!type.startsWith("payment.")) {
    return res.json({ success: true });
  }

  const tx = event.data || {};
  const reference = tx.reference || tx.id;
  if (!reference) {
    return res.json({ success: true });
  }

  const store = readStore();
  const current = store.items[reference] || {};
  store.items[reference] = {
    ...current,
    id: tx.id || current.id,
    reference,
    status: normalizePaymentStatus(tx.status || type),
    providerStatus: tx.status || current.providerStatus,
    completedAt: tx.completed_at || current.completedAt || null,
    updatedAt: nowIso(),
    payload: event,
  };
  writeStore(store);

  return res.json({ success: true });
});

export default router;
