import crypto from "crypto";

const NOTCHPAY_BASE_URL = "https://api.notchpay.co";

function getPublicKey() {
  return process.env.NOTCHPAY_PUBLIC_KEY || "";
}

function getPrivateKey() {
  return process.env.NOTCHPAY_PRIVATE_KEY || "";
}

function getHashKey() {
  return process.env.NOTCHPAY_HASH_KEY || "";
}

function isNotchPayConfigured() {
  return Boolean(getPublicKey() && getPrivateKey());
}

function buildHeaders(withGrant = true) {
  return {
    Authorization: getPublicKey(),
    ...(withGrant ? { "X-Grant": getPrivateKey() } : {}),
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "SungkuSuperApp/1.0",
  };
}

async function requestNotchPay(path, { method = "GET", body, withGrant = true } = {}) {
  const response = await fetch(`${NOTCHPAY_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(withGrant),
    ...(body ? { body: JSON.stringify(body) } : {}),
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

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function extractSignature(headers) {
  return (
    headers["x-notchpay-signature"] ||
    headers["x-notch-signature"] ||
    headers["x-webhook-signature"] ||
    headers["notchpay-signature"] ||
    ""
  );
}

function verifyNotchPaySignature(req) {
  const hashKey = getHashKey();
  if (!hashKey) return { ok: false, reason: "missing_hash_key" };

  const signature = extractSignature(req.headers || {});
  if (!signature) return { ok: false, reason: "missing_signature_header" };

  const rawBody = typeof req.rawBody === "string" ? req.rawBody : JSON.stringify(req.body || {});
  const expectedHex = crypto.createHmac("sha256", hashKey).update(rawBody, "utf8").digest("hex");
  const expectedBase64 = crypto.createHmac("sha256", hashKey).update(rawBody, "utf8").digest("base64");

  const ok = safeEqual(signature, expectedHex) || safeEqual(signature, expectedBase64);
  return { ok, reason: ok ? "ok" : "invalid_signature" };
}

export {
  NOTCHPAY_BASE_URL,
  getPublicKey,
  getPrivateKey,
  getHashKey,
  isNotchPayConfigured,
  requestNotchPay,
  verifyNotchPaySignature,
};
