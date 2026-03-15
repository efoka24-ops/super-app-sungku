import { buildApiUrl } from "../../../config";

export interface NotchPayBeneficiaryPayload {
  name: string;
  email?: string;
  phone?: string;
  account_number?: string;
  bank_code?: string;
  country: string;
  currency: string;
  type: "mobile_money" | "bank_account" | "cash_pickup";
  metadata?: Record<string, unknown>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `Erreur ${response.status}`);
  }
  return data as T;
}

export function getNotchPayBeneficiariesConfig() {
  return request<{ configured: boolean; provider: string }>("/api/notchpay-beneficiaries/config");
}

export function listNotchPayBeneficiaries(query?: Record<string, string>) {
  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  return request<{ success: boolean; payload: Record<string, unknown> }>(`/api/notchpay-beneficiaries/list${qs}`);
}

export function createNotchPayBeneficiary(payload: NotchPayBeneficiaryPayload) {
  return request<{ success: boolean; payload: Record<string, unknown> }>("/api/notchpay-beneficiaries/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getNotchPayBeneficiary(id: string) {
  return request<{ success: boolean; payload: Record<string, unknown> }>(`/api/notchpay-beneficiaries/${id}`);
}

export function updateNotchPayBeneficiary(id: string, payload: Partial<NotchPayBeneficiaryPayload>) {
  return request<{ success: boolean; payload: Record<string, unknown> }>(`/api/notchpay-beneficiaries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteNotchPayBeneficiary(id: string) {
  return request<{ success: boolean; message: string }>(`/api/notchpay-beneficiaries/${id}`, {
    method: "DELETE",
  });
}
