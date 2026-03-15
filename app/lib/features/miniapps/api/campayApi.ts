/**
 * CamPay API client — le frontend parle UNIQUEMENT au backend Sungku.
 * Les clés CamPay ne quittent jamais le backend (.env).
 */
import API_CONFIG from "../../../config";

const BASE = `${API_CONFIG.BACKEND_URL.replace(/\/$/, "")}/api/campay`;

export interface CollectRequest {
  amount: number;           // entier XAF, ≥ 100
  from: string;             // 237XXXXXXXXX (expéditeur)
  to?: string;              // 237XXXXXXXXX (bénéficiaire)
  description?: string;
  external_reference?: string;
  userId?: string;
}

export interface AirtimeRequest {
  amount: number;
  to: string;               // numéro à recharger
  from?: string;
  description?: string;
  external_reference?: string;
  userId?: string;
}

export type TxStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

export interface TxPollResult {
  success: boolean;
  status: TxStatus;
  reference: string;
  data?: Record<string, unknown>;
  message?: string;
}

export interface CamPayTx {
  id: string;
  type: "TRANSFER" | "AIRTIME";
  amount: number;
  currency: string;
  from_number: string;
  to_number: string;
  description: string;
  status: TxStatus;
  created_at: string;
  updated_at: string;
}

async function fetchJson(url: string, init?: RequestInit) {
  let r: Response;
  try {
    r = await fetch(url, init);
  } catch {
    throw new Error("Connexion au serveur impossible. Verifiez votre connexion puis reessayez.");
  }

  const raw = await r.text();
  let data: Record<string, unknown> = {};

  try {
    data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    const isHtml = /^\s*<!doctype html|^\s*<html/i.test(raw);
    if (isHtml) {
      throw new Error("Service temporairement indisponible. Reessayez dans quelques instants.");
    }
    throw new Error("Reponse invalide du serveur. Veuillez reessayer.");
  }

  if (!r.ok) {
    const message =
      typeof data.message === "string" && data.message.trim().length > 0
        ? data.message
        : `Erreur serveur (${r.status})`;
    return { success: false, message, code: data.code };
  }

  return data;
}

/** Initie un transfert Mobile Money (l'utilisateur reçoit un prompt USSD) */
export async function campayCollect(
  payload: CollectRequest
): Promise<{ success: boolean; reference?: string; message?: string; code?: string }> {
  return fetchJson(`${BASE}/collect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Initie une recharge airtime (MTN, Orange, Yoomee, Blue) */
export async function campayAirtime(
  payload: AirtimeRequest
): Promise<{ success: boolean; reference?: string; message?: string; code?: string }> {
  return fetchJson(`${BASE}/airtime`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Interroge le statut d'une transaction (polling toutes les 3s) */
export async function pollTransaction(reference: string): Promise<TxPollResult> {
  return fetchJson(`${BASE}/transaction/${encodeURIComponent(reference)}`);
}

/** Historique local des transactions d'un utilisateur */
export async function fetchCamPayHistory(
  userId: string,
  opts?: { type?: string; status?: string; page?: number }
): Promise<{ transactions: CamPayTx[]; total: number }> {
  const p = new URLSearchParams();
  if (opts?.type) p.set("type", opts.type);
  if (opts?.status) p.set("status", opts.status);
  if (opts?.page) p.set("page", String(opts.page));
  const d = await fetchJson(`${BASE}/history/${userId}?${p}`);
  return { transactions: d.transactions ?? [], total: d.total ?? 0 };
}
