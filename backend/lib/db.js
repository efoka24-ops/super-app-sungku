/**
 * db.js — Firestore (Firebase) comme base de données principale
 * ────────────────────────────────────────────────────────────────
 * Remplace Supabase. Fournit exactement le même contrat API :
 *   db.from(collection).select().eq().order().limit().maybeSingle()
 *   db.from(collection).insert(data)
 *   db.from(collection).update(data).eq(field, val)
 *   db.from(collection).upsert(data, opts)
 *   db.from(collection).delete().eq(field, val)
 *
 * Prérequis dans .env :
 *   FIREBASE_SERVICE_ACCOUNT_JSON=<base64 du service account JSON>
 *   FIREBASE_PROJECT_ID=sungku-send
 */

import admin from "firebase-admin";
import { createFirestoreDb } from "./firestoreDb.js";

const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
let db = null;

if (serviceAccountB64) {
  try {
    if (!admin.apps.length) {
      const sa = JSON.parse(Buffer.from(serviceAccountB64, "base64").toString("utf-8"));
      admin.initializeApp({
        credential: admin.credential.cert(sa),
        projectId: process.env.FIREBASE_PROJECT_ID || sa.project_id,
      });
    }
    db = createFirestoreDb();

    // Vérification de connexion non-bloquante
    admin.apps[0]
      .firestore()
      .collection("_health")
      .limit(1)
      .get()
      .then(() => console.log("✅ Firestore connected — tables ready"))
      .catch((e) => console.warn("⚠️  Firestore check:", e.message));
  } catch (e) {
    console.warn("[Firestore] Init failed:", e.message);
    db = null;
  }
} else {
  console.warn("⚠️  FIREBASE_SERVICE_ACCOUNT_JSON missing — DB writes will fall back to JSON.");
}

export { db };
export default db;
