import { Router } from "express";
import db from "../lib/db.js";
import { readCollection, writeCollection } from "../lib/store.js";
import { defaultFaq } from "../lib/defaults.js";

const router = Router();

router.get("/faq", async (req, res) => {
  const lang = req.query.lang === "en" ? "en" : "fr";

  if (db) {
    const { data, error } = await db
      .from("faq")
      .select("question,answer")
      .eq("language", lang)
      .order("sort_order", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return res.json({ language: lang, faqs: data });
    }
  }

  const store = readCollection("faq.json", defaultFaq());

  if (!store.fr || !store.en) {
    const defaults = defaultFaq();
    writeCollection("faq.json", defaults);
    return res.json({ language: lang, faqs: defaults[lang] });
  }

  return res.json({ language: lang, faqs: store[lang] });
});

export default router;
