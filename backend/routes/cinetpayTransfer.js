import { Router } from "express";
import { nowIso, readCollection, writeCollection } from "../lib/store.js";

const router = Router();
const CINETPAY_TRANSFER_BASE_URL = "https://client.cinetpay.com";
const AUTH_PATH = "/v1/auth/login";
const CONTACT_PATH = "/v1/transfer/contact";
const SEND_PATH = "/v1/transfer/money/send/contact";
const CHECK_PATH = "/v1/transfer/check/money";

function getTransferApiKey() {
  return process.env.CINETPAY_TRANSFER_API_KEY || process.env.CINETPAY_API_KEY || "";
}

function getTransferPassword() {
  return process.env.CINETPAY_TRANSFER_PASSWORD || process.env.CINETPAY_SECRET_KEY || "";
}

function hasTransferConfig() {
  return Boolean(getTransferApiKey() && getTransferPassword());
}

function readTransferStore() {
  return readCollection("cinetpay-transfer.json", {
    token: null,
    tokenUpdatedAt: null,
    contacts: {},
    transfers: {},
  });
}

function writeTransferStore(store) {
  writeCollection("cinetpay-transfer.json", store);
}

function normalizeTransferStatus(value) {
  const status = String(value || "").toUpperCase();
  if (["ACCEPTED", "SUCCESS", "VALIDATED", "COMPLETED", "SUCCESSFUL"].includes(status)) return "completed";
  if (["FAILED", "REFUSED", "CANCELLED", "REJECTED"].includes(status)) return "failed";
  return "pending";
}

async function postForm(path, body) {
  const response = await fetch(`${CINETPAY_TRANSFER_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      "User-Agent": "SungkuSuperApp/1.0",
    },
    body: new URLSearchParams(body),
  });

  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { raw };
  }

  return { response, data };
}

async function getJson(path, query) {
  const url = new URL(`${CINETPAY_TRANSFER_BASE_URL}${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "SungkuSuperApp/1.0",
    },
  });

  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = { raw };
  }

  return { response, data };
}

async function loginTransfer() {
  if (!hasTransferConfig()) {
    throw new Error("CINETPAY_TRANSFER_NOT_CONFIGURED");
  }

  const { response, data } = await postForm(AUTH_PATH, {
    apikey: getTransferApiKey(),
    password: getTransferPassword(),
  });

  const token = data?.token || data?.data?.token || data?.access_token || data?.data?.access_token;
  if (!response.ok || !token) {
    const message = data?.message || data?.description || "Connexion transfert CinetPay impossible";
    const error = new Error(message);
    error.details = data;
    throw error;
  }

  const store = readTransferStore();
  store.token = token;
  store.tokenUpdatedAt = nowIso();
  writeTransferStore(store);

  return { token, payload: data };
}

async function ensureTransferToken() {
  const store = readTransferStore();
  if (store.token) {
    return store.token;
  }
  const session = await loginTransfer();
  return session.token;
}

router.get("/config", (_req, res) => {
  res.json({
    configured: hasTransferConfig(),
    provider: "cinetpay-transfer",
    hasStoredToken: Boolean(readTransferStore().token),
  });
});

router.post("/login", async (_req, res) => {
  try {
    const result = await loginTransfer();
    return res.json({
      success: true,
      message: "Connexion CinetPay Transfer reussie",
      token: result.token,
      payload: result.payload,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : "Connexion CinetPay Transfer impossible",
      details: error?.details || null,
    });
  }
});

router.post("/contacts", async (req, res) => {
  const { prefix, phone, name, surname, email } = req.body || {};
  if (!prefix || !phone || !name) {
    return res.status(400).json({ success: false, message: "prefix, phone et name sont requis" });
  }

  try {
    const token = await ensureTransferToken();
    const contact = [{
      prefix: String(prefix),
      phone: String(phone),
      name: String(name),
      surname: String(surname || ""),
      email: String(email || ""),
    }];
    const { response, data } = await postForm(`${CONTACT_PATH}?token=${encodeURIComponent(token)}`, {
      data: JSON.stringify(contact),
    });

    const store = readTransferStore();
    store.contacts[`${prefix}${phone}`] = {
      prefix: String(prefix),
      phone: String(phone),
      name: String(name),
      surname: String(surname || ""),
      email: String(email || ""),
      updatedAt: nowIso(),
      payload: data,
    };
    writeTransferStore(store);

    return res.status(response.ok ? 200 : 502).json({
      success: response.ok,
      message: data?.message || data?.description || "Reponse CinetPay contact",
      payload: data,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : "Ajout contact CinetPay impossible",
      details: error?.details || null,
    });
  }
});

router.post("/send", async (req, res) => {
  const { amount, phone, prefix, notifyUrl, transactionId, userId } = req.body || {};
  const normalizedAmount = Math.round(Number(amount || 0));
  const transferId = String(transactionId || `TRF_${Date.now()}`);

  if (!phone || !prefix || !notifyUrl || !normalizedAmount) {
    return res.status(400).json({
      success: false,
      message: "amount, phone, prefix et notifyUrl sont requis",
    });
  }

  try {
    const token = await ensureTransferToken();
    const payloadData = [{
      amount: String(normalizedAmount),
      phone: String(phone),
      prefix: String(prefix),
      notify_url: String(notifyUrl),
    }];

    const { response, data } = await postForm(
      `${SEND_PATH}?token=${encodeURIComponent(token)}&transaction_id=${encodeURIComponent(transferId)}`,
      { data: JSON.stringify(payloadData) }
    );

    const providerStatus = data?.status || data?.code || data?.data?.status || data?.message;
    const store = readTransferStore();
    store.transfers[transferId] = {
      transactionId: transferId,
      userId: userId || "anonymous",
      amount: normalizedAmount,
      phone: String(phone),
      prefix: String(prefix),
      notifyUrl: String(notifyUrl),
      providerStatus,
      status: normalizeTransferStatus(providerStatus),
      createdAt: store.transfers[transferId]?.createdAt || nowIso(),
      updatedAt: nowIso(),
      payload: data,
    };
    writeTransferStore(store);

    return res.status(response.ok ? 200 : 502).json({
      success: response.ok,
      transactionId: transferId,
      status: store.transfers[transferId].status,
      providerStatus,
      message: data?.message || data?.description || "Reponse CinetPay transfert",
      payload: data,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : "Transfert CinetPay impossible",
      details: error?.details || null,
    });
  }
});

router.get("/check/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  try {
    const token = await ensureTransferToken();
    const { response, data } = await getJson(CHECK_PATH, {
      token,
      transaction_id: transactionId,
    });

    const providerStatus = data?.status || data?.code || data?.data?.status || data?.message;
    const store = readTransferStore();
    const previous = store.transfers[transactionId] || {};
    store.transfers[transactionId] = {
      ...previous,
      transactionId,
      providerStatus,
      status: normalizeTransferStatus(providerStatus),
      updatedAt: nowIso(),
      payload: data,
    };
    writeTransferStore(store);

    return res.status(response.ok ? 200 : 502).json({
      success: response.ok,
      transactionId,
      status: store.transfers[transactionId].status,
      providerStatus,
      message: data?.message || data?.description || "Reponse CinetPay statut transfert",
      payload: data,
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : "Verification transfert CinetPay impossible",
      details: error?.details || null,
    });
  }
});

export default router;