import { Router } from "express";
import { readCollection, writeCollection, nowIso } from "../lib/store.js";

const router = Router();

router.get("/:userId", (req, res) => {
  const contactsStore = readCollection("contacts.json", {});
  return res.json({ userId: req.params.userId, contacts: contactsStore[req.params.userId] || [] });
});

router.post("/:userId", (req, res) => {
  const { userId } = req.params;
  const { name, phone } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ message: "Missing contact name or phone" });
  }

  const contactsStore = readCollection("contacts.json", {});
  const current = contactsStore[userId] || [];
  const next = {
    id: `contact_${Date.now()}`,
    name,
    phone,
    createdAt: nowIso(),
  };

  contactsStore[userId] = [next, ...current];
  writeCollection("contacts.json", contactsStore);

  return res.status(201).json({ message: "Contact created", contact: next });
});

router.delete("/:userId/:contactId", (req, res) => {
  const { userId, contactId } = req.params;
  const contactsStore = readCollection("contacts.json", {});
  const current = contactsStore[userId] || [];
  contactsStore[userId] = current.filter((item) => item.id !== contactId);
  writeCollection("contacts.json", contactsStore);
  return res.json({ message: "Contact deleted" });
});

export default router;
