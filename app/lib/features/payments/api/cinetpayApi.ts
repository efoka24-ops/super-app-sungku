import { buildApiUrl } from "../../../config";

export type CinetPayFlowType = "send" | "pay" | "receive";

export interface CinetPayInitiatePayload {
  amount: number;
  description: string;
  userId?: string;
  flowType: CinetPayFlowType;
  recipient?: string;
  customerName?: string;
  customerSurname?: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  metadata?: Record<string, unknown>;
}

export interface CinetPayInitiateResponse {
  success: boolean;
  transactionId: string;
  paymentUrl: string;
  paymentToken?: string;
  status: string;
  message: string;
}

export interface CinetPayCheckResponse {
  success: boolean;
  transactionId: string;
  status: "pending" | "completed" | "failed";
  providerStatus?: string;
  message: string;
  transaction?: Record<string, unknown>;
}

export async function getCinetPayConfig() {
  const response = await fetch(buildApiUrl("/api/cinetpay/config"));
  if (!response.ok) {
    throw new Error("Impossible de verifier la configuration CinetPay");
  }
  return response.json() as Promise<{ configured: boolean; provider: string }>;
}

export async function initiateCinetPayPayment(payload: CinetPayInitiatePayload): Promise<CinetPayInitiateResponse> {
  const response = await fetch(buildApiUrl("/api/cinetpay/initiate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Impossible de lancer le paiement CinetPay");
  }
  return data as CinetPayInitiateResponse;
}

export async function checkCinetPayPayment(transactionId: string): Promise<CinetPayCheckResponse> {
  const response = await fetch(buildApiUrl(`/api/cinetpay/check/${transactionId}`));
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Impossible de verifier le paiement CinetPay");
  }
  return data as CinetPayCheckResponse;
}

export function openCinetPayPayment(paymentUrl: string) {
  const paymentWindow = window.open(paymentUrl, "_blank", "noopener,noreferrer");
  if (!paymentWindow) {
    window.location.href = paymentUrl;
  }
}