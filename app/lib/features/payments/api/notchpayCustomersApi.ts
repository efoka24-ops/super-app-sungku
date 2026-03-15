import { buildApiUrl } from "../../../config";

export interface NotchPayCustomerPayload {
  name: string;
  email?: string;
  phone?: string;
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

export function getNotchPayCustomersConfig() {
  return request<{ configured: boolean; provider: string }>("/api/notchpay-customers/config");
}

export function listNotchPayCustomers(query?: Record<string, string>) {
  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  return request<{ success: boolean; payload: Record<string, unknown> }>(`/api/notchpay-customers/list${qs}`);
}

export function createNotchPayCustomer(payload: NotchPayCustomerPayload) {
  return request<{ success: boolean; payload: Record<string, unknown> }>("/api/notchpay-customers/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getNotchPayCustomer(id: string) {
  return request<{ success: boolean; payload: Record<string, unknown> }>(`/api/notchpay-customers/${id}`);
}

export function updateNotchPayCustomer(id: string, payload: Partial<NotchPayCustomerPayload>) {
  return request<{ success: boolean; payload: Record<string, unknown> }>(`/api/notchpay-customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteNotchPayCustomer(id: string) {
  return request<{ success: boolean; message: string }>(`/api/notchpay-customers/${id}`, {
    method: "DELETE",
  });
}

export function listNotchPayCustomerPayments(id: string, query?: Record<string, string>) {
  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  return request<{ success: boolean; payload: Record<string, unknown> }>(`/api/notchpay-customers/${id}/payments${qs}`);
}
