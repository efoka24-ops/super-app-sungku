/**
 * Firestore Query Builder - Supabase-compatible adapter
 * Mutations : throw si erreur (les .catch(fn) des routes logguent l erreur)
 * Lectures  : retourne { data: null, error } si erreur (if (data) fait fallback JSON)
 */

import admin from "firebase-admin";

let _fs = null;

function getFirestore() {
  if (_fs) return _fs;
  try {
    const app = admin.apps.length > 0 ? admin.apps[0] : null;
    if (!app) return null;
    _fs = app.firestore();
    return _fs;
  } catch (e) {
    console.warn("[Firestore] getFirestore error:", e.message);
    return null;
  }
}

const DOC_ID_BY_USER = new Set(["users", "profile_stats"]);

function deriveDocId(collectionName, data) {
  if (DOC_ID_BY_USER.has(collectionName) && data.user_id) return String(data.user_id);
  if (data.id) return String(data.id);
  if (data.user_id) return String(data.user_id);
  return null;
}

// Firestore ne supporte pas undefined — supprimer ces clés
function stripUndefined(obj) {
  const cleaned = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) cleaned[key] = obj[key];
  }
  return cleaned;
}

class FSQuery {
  constructor(collectionName) {
    this._col = collectionName;
    this._wheres = [];
    this._orderField = null;
    this._orderAsc = true;
    this._limitN = null;
    this._mode = "select";
    this._payload = null;
    this._upsertOpts = null;
  }

  select(_fields) { this._mode = "select"; return this; }

  eq(field, value) {
    this._wheres.push([field, "==", value]);
    return this;
  }

  order(field, opts) {
    const ascending = opts && opts.ascending !== undefined ? opts.ascending : true;
    this._orderField = field;
    this._orderAsc = ascending;
    return this;
  }

  limit(n) { this._limitN = Number(n); return this; }

  insert(data) { this._mode = "insert"; this._payload = data; return this; }
  update(data) { this._mode = "update"; this._payload = data; return this; }
  upsert(data, opts) { this._mode = "upsert"; this._payload = data; this._upsertOpts = opts; return this; }
  delete() { this._mode = "delete"; return this; }

  async maybeSingle() {
    const saved = this._limitN;
    this._limitN = 1;
    const result = await this._safeSelect();
    this._limitN = saved;
    return { data: result.data ? result.data[0] || null : null, error: result.error || null };
  }

  _isMutation() {
    return ["insert", "update", "upsert", "delete"].includes(this._mode);
  }

  then(resolve, reject) {
    const p = this._isMutation() ? this._execMutation() : this._safeSelect();
    return p.then(resolve, reject);
  }

  catch(fn) {
    const p = this._isMutation() ? this._execMutation() : this._safeSelect();
    return p.catch(fn);
  }

  _colRef(fs) { return fs.collection(this._col); }

  _applyWheres(col) {
    let q = col;
    for (const w of this._wheres) {
      q = q.where(w[0], w[1], w[2]);
    }
    return q;
  }

  async _safeSelect() {
    try {
      return await this._execSelect();
    } catch (e) {
      console.error("[Firestore] select " + this._col + ":", e.message);
      return { data: null, error: e };
    }
  }

  async _execMutation() {
    switch (this._mode) {
      case "insert": return this._execInsert();
      case "update": return this._execUpdate();
      case "upsert": return this._execUpsert();
      case "delete": return this._execDelete();
      default: return { data: null, error: null };
    }
  }

  async _execSelect() {
    const fs = getFirestore();
    if (!fs) throw new Error("Firestore not initialized");

    const q = this._applyWheres(this._colRef(fs));
    const snap = await q.get();
    let docs = snap.docs.map(function(d) { return d.data(); });

    if (this._orderField) {
      const f = this._orderField;
      const asc = this._orderAsc;
      docs.sort(function(a, b) {
        const av = a[f], bv = b[f];
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return asc ? cmp : -cmp;
      });
    }

    if (this._limitN != null) docs = docs.slice(0, this._limitN);
    return { data: docs, error: null };
  }

  async _execInsert() {
    const fs = getFirestore();
    if (!fs) throw new Error("Firestore not initialized");

    const items = Array.isArray(this._payload) ? this._payload : [this._payload];
    const batch = fs.batch();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const clean = stripUndefined(item);
      const docId = deriveDocId(this._col, item) || fs.collection(this._col).doc().id;
      batch.set(fs.collection(this._col).doc(docId), clean);
    }

    await batch.commit();
    return { data: items, error: null };
  }

  async _execUpdate() {
    const fs = getFirestore();
    if (!fs) throw new Error("Firestore not initialized");

    const q = this._applyWheres(this._colRef(fs));
    const snap = await q.get();
    if (snap.empty) return { data: null, error: null };

    const batch = fs.batch();
    snap.docs.forEach(function(d) { batch.update(d.ref, this._payload); }.bind(this));
    await batch.commit();
    return { data: null, error: null };
  }

  async _execUpsert() {
    const fs = getFirestore();
    if (!fs) throw new Error("Firestore not initialized");

    const items = Array.isArray(this._payload) ? this._payload : [this._payload];
    const conflictField = this._upsertOpts && this._upsertOpts.onConflict;
    const batch = fs.batch();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const clean = stripUndefined(item);
      const docId =
        (conflictField && item[conflictField] != null ? String(item[conflictField]) : null) ||
        deriveDocId(this._col, item) ||
        fs.collection(this._col).doc().id;
      batch.set(fs.collection(this._col).doc(docId), clean, { merge: true });
    }

    await batch.commit();
    return { data: items, error: null };
  }

  async _execDelete() {
    const fs = getFirestore();
    if (!fs) throw new Error("Firestore not initialized");

    const q = this._applyWheres(this._colRef(fs));
    const snap = await q.get();
    if (snap.empty) return { data: null, error: null };

    const batch = fs.batch();
    const cleanPayload = stripUndefined(this._payload);
    snap.docs.forEach(function(d) { batch.update(d.ref, cleanPayload); });
    await batch.commit();
    return { data: null, error: null };
  }
}

export function createFirestoreDb() {
  return {
    from: function(collectionName) {
      return new FSQuery(collectionName);
    }
  };
}
