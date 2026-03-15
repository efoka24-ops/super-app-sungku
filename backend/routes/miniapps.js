import { Router } from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (db) {
    const { data } = await db.from("user_miniapps").select("*").eq("user_id", userId);
    if (data) return res.json({ miniapps: data.map(r => ({ id: r.id, appId: r.app_id, userId: r.user_id, name: r.name, icon: r.icon, category: r.category, installedAt: r.installed_at })) });
  }
  const store = readCollection("miniapps.json", {});
  return res.json({ miniapps: store[userId] || [] });
});

router.post("/:userId/install", async (req, res) => {
  const { userId } = req.params;
  const { appId } = req.body || {};
  if (!appId) return res.status(400).json({ message: "appId required" });
  const id  = `mapp_${Date.now()}`;
  const now = nowIso();

  // Look up catalog details
  let name, icon, category;
  if (db) {
    const { data } = await db.from("miniapps_catalog").select("*").eq("id", appId).maybeSingle();
    if (data) { name = data.name; icon = data.icon; category = data.category; }
  } else {
    const catalog = readCollection("miniapps-catalog.json", []);
    const entry   = catalog.find(a => a.id === appId);
    if (entry) { name = entry.name; icon = entry.icon; category = entry.category; }
  }

  const miniapp = { id, appId, userId, name, icon, category, installedAt: now };
  if (db) await db.from("user_miniapps").upsert({ id, app_id: appId, user_id: userId, name, icon, category, installed_at: now }, { onConflict: "user_id,app_id" }).catch(e => console.error("Supabase install:", e.message));
  const store = readCollection("miniapps.json", {});
  store[userId] = [...(store[userId] || []).filter(m => m.appId !== appId), miniapp];
  writeCollection("miniapps.json", store);
  return res.status(201).json({ message: "Mini-app installed", miniapp });
});

router.delete("/:userId/:appId", async (req, res) => {
  const { userId, appId } = req.params;
  if (db) await db.from("user_miniapps").delete().eq("user_id", userId).eq("app_id", appId).catch(() => {});
  const store = readCollection("miniapps.json", {});
  store[userId] = (store[userId] || []).filter(m => m.appId !== appId);
  writeCollection("miniapps.json", store);
  return res.json({ message: "Mini-app uninstalled" });
});

export default router;
