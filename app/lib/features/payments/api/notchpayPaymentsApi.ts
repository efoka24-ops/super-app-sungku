import { buildApiUrl } from "../../../config";

export interface NotchPayCreatePaymentPayload {
  amount: number;
  currency?: string;
  email?: string;
  phone?: string;
  customer?: string | Record<string, unknown>;
  description?: string;
  reference?: string;
  callback?: string;
  metadata?: Record<string, unknown>;
  locked_channel?: string;
  locked_country?: string;
  locked_currency?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status}`);
  }
  return data as T;
}

export function getNotchPayPaymentsConfig() {
  return request<{ configured: boolean; provider: string }>("/api/notchpay-payments/config");
}

export function listNotchPayPayments(query?: Record<string, string>) {
  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  return request<{ success: boolean; payload: Record<string, unknown> }>(`/api/notchpay-payments/list${qs}`);
}

export function createNotchPayPayment(payload: NotchPayCreatePaymentPayload) {
  return request<{ success: boolean; authorizationUrl?: string; reference: string; payment: Record<string, unknown> }>("/api/notchpay-payments/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function checkNotchPayPayment(reference: string) {
  return request<{ success: boolean; payment: Record<string, unknown> }>(`/api/notchpay-payments/check/${reference}`);
}

export function processNotchPayPayment(reference: string, channel: string, data?: Record<string, unknown>) {
  return request<{ success: boolean; payload: Record<string, unknown> }>(`/api/notchpay-payments/process/${reference}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, ...(data ? { data } : {}) }),
  });
}

export function cancelNotchPayPayment(reference: string) {
  return request<{ success: boolean; message: string }>(`/api/notchpay-payments/cancel/${reference}`, {
    method: "DELETE",
  });
}
