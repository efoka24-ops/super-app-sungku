import { buildApiUrl } from "../../../config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NotchPayBeneficiaryData {
  name: string;
  phone: string;
  email?: string;
  account_number?: string;
  bank_code?: string;
  country?: string;
}

export interface NotchPayTransferPayload {
  amount: number;
  currency?: string;
  beneficiary?: string;
  beneficiary_data?: NotchPayBeneficiaryData;
  channel: string; // e.g. "cm.mtn", "cm.orange"
  description?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
}

export interface NotchPayTransferResponse {
  success: boolean;
  reference: string;
  transferId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
  transfer?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  errors?: Record<string, unknown> | null;
}

export interface NotchPayTransferCheckResponse {
  success: boolean;
  reference: string;
  transferId?: string;
  status: "pending" | "processing" | "completed" | "failed";
  providerStatus?: string;
  message: string;
  transfer?: Record<string, unknown>;
}

export interface NotchPayTransferConfigResponse {
  configured: boolean;
  provider: string;
  channels: string[];
}

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

async function post<T>(path: string, body: object): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status}`);
  }
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path));
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status}`);
  }
  return data as T;
}

async function del<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), { method: "DELETE" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status}`);
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns whether the NotchPay backend proxy is configured. */
export async function getNotchPayTransferConfig(): Promise<NotchPayTransferConfigResponse> {
  return get<NotchPayTransferConfigResponse>("/api/notchpay-transfer/config");
}

/**
 * Creates a new payout transfer.
 * If `beneficiary` is omitted, provide `beneficiary_data` with at least name and phone.
 */
export async function sendNotchPayTransfer(payload: NotchPayTransferPayload): Promise<NotchPayTransferResponse> {
  return post<NotchPayTransferResponse>("/api/notchpay-transfer/send", payload);
}

/** Retrieves the current status of a transfer by local reference or provider ID. */
export async function checkNotchPayTransfer(reference: string): Promise<NotchPayTransferCheckResponse> {
  return get<NotchPayTransferCheckResponse>(`/api/notchpay-transfer/check/${reference}`);
}

/** Cancels a pending transfer. */
export async function cancelNotchPayTransfer(reference: string): Promise<{ success: boolean; reference: string; message: string }> {
  return del<{ success: boolean; reference: string; message: string }>(`/api/notchpay-transfer/cancel/${reference}`);
}

/** Returns the last locally stored transfers for a user. */
export async function fetchNotchPayTransferHistory(userId: string): Promise<{ success: boolean; transfers: unknown[]; total: number }> {
  return get<{ success: boolean; transfers: unknown[]; total: number }>(`/api/notchpay-transfer/history/${userId}`);
}
