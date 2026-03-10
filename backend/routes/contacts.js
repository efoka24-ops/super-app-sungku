import { Router } from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = Router();

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (db) {
    const { data } = await db.from("contacts").select("*").eq("user_id", userId).order("added_at", { ascending: false });
    if (data) return res.json({ contacts: data.map(r => ({ id: r.id, userId: r.user_id, name: r.name, phoneNumber: r.phone_number, avatar: r.avatar, email: r.email, addedAt: r.added_at })) });
  }
  const store = readCollection("contacts.json", {});
  return res.json({ contacts: store[userId] || [] });
});

router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, phoneNumber, avatar, email } = req.body || {};
  if (!name || !phoneNumber) return res.status(400).json({ message: "name and phoneNumber required" });

  const id  = `contact_${Date.now()}`;
  const now = nowIso();
  const contact = { id, userId, name, phoneNumber, avatar, email, addedAt: now };

  if (db) await db.from("contacts").insert({ id, user_id: userId, name, phone_number: phoneNumber, avatar, email, added_at: now }).catch(e => console.error("Supabase contact insert:", e.message));

  const store = readCollection("contacts.json", {});
  store[userId] = [ contact, ...(store[userId] || []) ];
  writeCollection("contacts.json", store);
  return res.status(201).json({ message: "Contact added", contact });
});

router.delete("/:userId/:contactId", async (req, res) => {
  const { userId, contactId } = req.params;
  if (db) await db.from("contacts").delete().eq("id", contactId).eq("user_id", userId).catch(() => {});
  const store = readCollection("contacts.json", {});
  store[userId] = (store[userId] || []).filter(c => c.id !== contactId);
  writeCollection("contacts.json", store);
  return res.json({ message: "Contact deleted" });
});

export default router;
