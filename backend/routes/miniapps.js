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
  const { appId, phone, deviceMeta } = req.body || {};
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

  const miniapp = { id, appId, userId, name, icon, category, installedAt: now, deviceMeta: deviceMeta || null };
  if (db) {
    const { error } = await db
      .from("user_miniapps")
      .upsert({ id, app_id: appId, user_id: userId, name, icon, category, installed_at: now }, { onConflict: "user_id,app_id" });
    if (error) {
      console.error("Supabase install:", error.message);
    }
  }
  const store = readCollection("miniapps.json", {});
  store[userId] = [...(store[userId] || []).filter(m => m.appId !== appId), miniapp];
  writeCollection("miniapps.json", store);

  // Update installation KPI counters in catalog (unique users and phones)
  const catalog = readCollection("miniapps-catalog.json", []);
  const catalogEntry = catalog.find((entry) => entry.id === appId);
  if (catalogEntry) {
    if (!Array.isArray(catalogEntry.installedUsers)) catalogEntry.installedUsers = [];
    if (!Array.isArray(catalogEntry.installedPhones)) catalogEntry.installedPhones = [];
    if (!catalogEntry.installedUsers.includes(userId)) catalogEntry.installedUsers.push(userId);
    if (phone && !catalogEntry.installedPhones.includes(phone)) catalogEntry.installedPhones.push(phone);

    catalogEntry.installations = Number(catalogEntry.installations || 0) + 1;
    catalogEntry.uniqueUsers = catalogEntry.installedUsers.length;
    catalogEntry.uniquePhones = catalogEntry.installedPhones.length;
    catalogEntry.lastInstalledAt = now;

    if (!Array.isArray(catalogEntry.installEvents)) {
      catalogEntry.installEvents = [];
    }
    catalogEntry.installEvents.push({
      at: now,
      userId,
      phone: phone || null,
      deviceMeta: deviceMeta || null,
    });

    writeCollection("miniapps-catalog.json", catalog);
  }

  return res.status(201).json({ message: "Mini-app installed", miniapp });
});

router.delete("/:userId/:appId", async (req, res) => {
  const { userId, appId } = req.params;
  if (db) {
    await db.from("user_miniapps").delete().eq("user_id", userId).eq("app_id", appId);
  }
  const store = readCollection("miniapps.json", {});
  store[userId] = (store[userId] || []).filter(m => m.appId !== appId);
  writeCollection("miniapps.json", store);
  return res.json({ message: "Mini-app uninstalled" });
});

export default router;
