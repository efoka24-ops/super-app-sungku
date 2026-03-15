import { buildApiUrl } from "../../../config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TransferContact {
  prefix: string;
  phone: string;
  name: string;
  surname?: string;
  email?: string;
}

export interface TransferSendPayload {
  /** Amount in local currency (integer) */
  amount: number;
  /** Recipient phone number (without prefix) */
  phone: string;
  /** Country calling code, e.g. "237" for Cameroon */
  prefix: string;
  /** Backend will fill this from BACKEND_PUBLIC_URL when omitted */
  notifyUrl?: string;
  /** Unique identifier; backend generates one when omitted */
  transactionId?: string;
  /** App user ID for internal bookkeeping */
  userId?: string;
}

export interface TransferSendResponse {
  success: boolean;
  transactionId: string;
  status: "pending" | "completed" | "failed";
  providerStatus?: string;
  message: string;
  payload?: Record<string, unknown>;
}

export interface TransferCheckResponse {
  success: boolean;
  transactionId: string;
  status: "pending" | "completed" | "failed";
  providerStatus?: string;
  message: string;
  payload?: Record<string, unknown>;
}

export interface TransferConfigResponse {
  configured: boolean;
  provider: string;
  hasStoredToken: boolean;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function post<T>(path: string, body: object): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status} sur ${path}`);
  }
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path));
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status} sur ${path}`);
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns whether the backend transfer API is configured. */
export async function getCinetPayTransferConfig(): Promise<TransferConfigResponse> {
  return get<TransferConfigResponse>("/api/cinetpay-transfer/config");
}

/**
 * Triggers a backend login against client.cinetpay.com and stores the JWT
 * for subsequent calls. Usually not needed manually — send/check auto-login.
 */
export async function loginCinetPayTransfer(): Promise<{ success: boolean; message: string; token?: string }> {
  return post("/api/cinetpay-transfer/login", {});
}

/**
 * Registers a contact at CinetPay before sending money to them.
 * Required once per recipient (cached by the backend).
 */
export async function addTransferContact(contact: TransferContact): Promise<{ success: boolean; message: string }> {
  return post("/api/cinetpay-transfer/contacts", contact);
}

/**
 * Initiates a money transfer to a mobile number via the CinetPay payout API.
 * The transfer goes directly to the recipient's mobile wallet without any
 * hosted checkout page.
 */
export async function sendCinetPayTransfer(payload: TransferSendPayload): Promise<TransferSendResponse> {
  return post<TransferSendResponse>("/api/cinetpay-transfer/send", payload);
}

/**
 * Checks the current status of a transfer.
 */
export async function checkCinetPayTransfer(transactionId: string): Promise<TransferCheckResponse> {
  return get<TransferCheckResponse>(`/api/cinetpay-transfer/check/${transactionId}`);
}
