import { Router } from "express";
import { readCollection, writeCollection } from "../lib/store.js";
import { defaultFaq } from "../lib/defaults.js";

const router = Router();

router.get("/faq", (req, res) => {
  const lang = req.query.lang === "en" ? "en" : "fr";
  const store = readCollection("faq.json", defaultFaq());

  if (!store.fr || !store.en) {
    const defaults = defaultFaq();
    writeCollection("faq.json", defaults);
    return res.json({ language: lang, faqs: defaults[lang] });
  }

  return res.json({ language: lang, faqs: store[lang] });
});

export default router;
