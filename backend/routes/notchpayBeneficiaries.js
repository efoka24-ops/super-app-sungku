import { Router } from "express";
import { isNotchPayConfigured, requestNotchPay } from "../lib/notchpay.js";

const router = Router();

router.get("/config", (_req, res) => {
  res.json({ configured: isNotchPayConfigured(), provider: "notchpay-beneficiaries" });
});

router.get("/list", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const query = new URLSearchParams(req.query || {}).toString();
  const { response, data } = await requestNotchPay(query ? `/beneficiaries?${query}` : "/beneficiaries", { withGrant: true });
  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Beneficiaires recuperes" });
});

router.post("/create", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }

  const { name, email, phone, account_number, bank_code, country, currency, type, metadata } = req.body || {};
  if (!name || !country || !currency || !type) {
    return res.status(400).json({ success: false, message: "name, country, currency, type sont requis" });
  }

  const payload = {
    name,
    country,
    currency,
    type,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(account_number ? { account_number } : {}),
    ...(bank_code ? { bank_code } : {}),
    ...(metadata ? { metadata } : {}),
  };

  const { response, data } = await requestNotchPay("/beneficiaries", {
    method: "POST",
    body: payload,
    withGrant: true,
  });

  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Beneficiaire cree" });
});

router.get("/:id", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const { response, data } = await requestNotchPay(`/beneficiaries/${encodeURIComponent(req.params.id)}`, { withGrant: true });
  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Beneficiaire recupere" });
});

router.put("/:id", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const { name, email, phone, account_number, bank_code, metadata } = req.body || {};
  const payload = {
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(account_number ? { account_number } : {}),
    ...(bank_code ? { bank_code } : {}),
    ...(metadata ? { metadata } : {}),
  };
  const { response, data } = await requestNotchPay(`/beneficiaries/${encodeURIComponent(req.params.id)}`, {
    method: "PUT",
    body: payload,
    withGrant: true,
  });
  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Beneficiaire mis a jour" });
});

router.delete("/:id", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const { response, data } = await requestNotchPay(`/beneficiaries/${encodeURIComponent(req.params.id)}`, {
    method: "DELETE",
    withGrant: true,
  });
  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Beneficiaire supprime" });
});

export default router;
