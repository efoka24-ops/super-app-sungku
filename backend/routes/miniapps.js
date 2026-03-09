import { Router } from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = Router();

router.get("/:userId", (req, res) => {
  const store = readCollection("miniapps.json", {});
  return res.json({ userId: req.params.userId, miniApps: store[req.params.userId] || [] });
});

router.post("/:userId/install", (req, res) => {
  const { userId } = req.params;
  const { appId, name } = req.body || {};

  if (!appId || !name) {
    return res.status(400).json({ message: "Missing appId or name" });
  }

  const store = readCollection("miniapps.json", {});
  const current = store[userId] || [];

  if (current.some((item) => item.appId === appId)) {
    return res.status(409).json({ message: "Mini app already installed" });
  }

  const installed = {
    appId,
    name,
    installedAt: nowIso(),
  };

  store[userId] = [installed, ...current];
  writeCollection("miniapps.json", store);
  return res.status(201).json({ message: "Mini app installed", miniApp: installed });
});

router.delete("/:userId/:appId", (req, res) => {
  const { userId, appId } = req.params;
  const store = readCollection("miniapps.json", {});
  const current = store[userId] || [];
  store[userId] = current.filter((item) => item.appId !== appId);
  writeCollection("miniapps.json", store);
  return res.json({ message: "Mini app uninstalled" });
});

export default router;
