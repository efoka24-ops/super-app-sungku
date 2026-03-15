/**
 * Firebase Admin SDK — initialisation conditionnelle
 * ────────────────────────────────────────────────────────────────
 * Pour activer Firebase Admin sur le backend :
 *
 * 1. Firebase Console → Project settings → Service accounts
 *    → Generate new private key → télécharger le JSON
 *
 * 2. Encoder le JSON en base64 :
 *    PowerShell : [Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
 *    Linux/Mac  : base64 -w 0 service-account.json
 *
 * 3. Copier la chaîne base64 dans .env :
 *    FIREBASE_SERVICE_ACCOUNT_JSON=<base64_string>
 *    FIREBASE_PROJECT_ID=sungku-send
 *
 * Capacités activées quand Firebase Admin est configuré :
 *   - createFirebaseCustomToken(uid)  → échange JWT interne → Firebase ID token
 *   - verifyFirebaseIdToken(idToken)  → validation côté backend du token Firebase
 *   - sendFcmNotification(token, …)   → push notification via FCM
 */

let _admin = null;
let _app   = null;
let _initialized = false;

async function init() {
  if (_initialized) return _app;
  _initialized = true;

  const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountB64) {
    console.log("[Firebase] FIREBASE_SERVICE_ACCOUNT_JSON non défini — Firebase Admin désactivé.");
    return null;
  }

  try {
    // Dynamic import pour éviter une erreur hard si le package n'est pas installé
    const module = await import("firebase-admin").catch(() => null);
    if (!module) {
      console.warn("[Firebase] Package firebase-admin introuvable. Lancez : npm install firebase-admin --prefix backend");
      return null;
    }

    _admin = module.default;

    if (_admin.apps.length) {
      _app = _admin.apps[0];
      return _app;
    }

    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountB64, "base64").toString("utf-8")
    );

    _app = _admin.initializeApp({
      credential:  _admin.credential.cert(serviceAccount),
      projectId:   process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });

    console.log(`✅ [Firebase] Admin SDK initialisé (projet: ${process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id})`);
    return _app;
  } catch (e) {
    console.warn("[Firebase] Échec d'initialisation:", e.message);
    return null;
  }
}

/**
 * Crée un custom token Firebase pour un userId.
 * Retourne null si Firebase Admin n'est pas configuré.
 * Le frontend échange ce token avec Firebase pour obtenir un ID token standard.
 */
export async function createFirebaseCustomToken(uid) {
  try {
    await init();
    if (!_admin) return null;
    return await _admin.auth().createCustomToken(String(uid));
  } catch (e) {
    console.warn("[Firebase] createCustomToken error:", e.message);
    return null;
  }
}

/**
 * Vérifie un Firebase ID token envoyé par le client.
 * Retourne le decoded token ou null.
 */
export async function verifyFirebaseIdToken(idToken) {
  try {
    await init();
    if (!_admin) return null;
    return await _admin.auth().verifyIdToken(idToken);
  } catch (e) {
    console.warn("[Firebase] verifyIdToken error:", e.message);
    return null;
  }
}

/**
 * Envoie une notification push via Firebase Cloud Messaging.
 * @param {string} deviceToken  - Token FCM du destinataire
 * @param {string} title        - Titre de la notification
 * @param {string} body         - Corps du message
 * @param {object} data         - Données additionnelles (optionnel)
 */
export async function sendFcmNotification(deviceToken, title, body, data = {}) {
  try {
    await init();
    if (!_admin) return null;

    const message = {
      token: deviceToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: "high",
        notification: { sound: "default" },
      },
      apns: {
        payload: { aps: { sound: "default" } },
      },
    };

    const response = await _admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (e) {
    console.warn("[Firebase] FCM send error:", e.message);
    return { success: false, error: e.message };
  }
}

export const isFirebaseConfigured = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
