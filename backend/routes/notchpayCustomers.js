import { Router } from "express";
import { isNotchPayConfigured, requestNotchPay } from "../lib/notchpay.js";

const router = Router();

router.get("/config", (_req, res) => {
  res.json({ configured: isNotchPayConfigured(), provider: "notchpay-customers" });
});

router.get("/list", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const query = new URLSearchParams(req.query || {}).toString();
  const { response, data } = await requestNotchPay(query ? `/customers?${query}` : "/customers", { withGrant: false });
  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Customers recuperes" });
});

router.post("/create", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const { name, email, phone, metadata } = req.body || {};
  if (!name) {
    return res.status(400).json({ success: false, message: "name est requis" });
  }
  if (!email && !phone) {
    return res.status(400).json({ success: false, message: "email ou phone est requis" });
  }

  const { response, data } = await requestNotchPay("/customers", {
    method: "POST",
    body: { name, ...(email ? { email } : {}), ...(phone ? { phone } : {}), ...(metadata ? { metadata } : {}) },
    withGrant: false,
  });

  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Customer cree" });
});

router.get("/:id", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const { response, data } = await requestNotchPay(`/customers/${encodeURIComponent(req.params.id)}`, { withGrant: false });
  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Customer recupere" });
});

router.put("/:id", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const { name, email, phone, metadata } = req.body || {};
  const { response, data } = await requestNotchPay(`/customers/${encodeURIComponent(req.params.id)}`, {
    method: "PUT",
    body: { ...(name ? { name } : {}), ...(email ? { email } : {}), ...(phone ? { phone } : {}), ...(metadata ? { metadata } : {}) },
    withGrant: false,
  });
  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Customer mis a jour" });
});

router.delete("/:id", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const { response, data } = await requestNotchPay(`/customers/${encodeURIComponent(req.params.id)}`, {
    method: "DELETE",
    withGrant: false,
  });
  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Customer supprime" });
});

router.get("/:id/payments", async (req, res) => {
  if (!isNotchPayConfigured()) {
    return res.status(503).json({ success: false, message: "NotchPay non configure" });
  }
  const query = new URLSearchParams(req.query || {}).toString();
  const path = query
    ? `/customers/${encodeURIComponent(req.params.id)}/payments?${query}`
    : `/customers/${encodeURIComponent(req.params.id)}/payments`;
  const { response, data } = await requestNotchPay(path, { withGrant: false });
  return res.status(response.status).json({ success: response.ok, payload: data, message: data?.message || "Paiements client recuperes" });
});

export default router;
