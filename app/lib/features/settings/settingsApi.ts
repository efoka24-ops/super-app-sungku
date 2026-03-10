import API_CONFIG from "../../config";

const API_BASE = `${API_CONFIG.BACKEND_URL.replace(/\/$/, "")}/api`;

export interface LanguagePayload {
  language: "fr" | "en";
}

export interface SecurityPayload {
  currentPassword?: string;
  newPassword?: string;
  twoFactorEnabled?: boolean;
  biometricsEnabled?: boolean;
}

/**
 * Update user language preference
 */
export async function updateLanguage(
  userId: string,
  language: "fr" | "en"
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/settings/${userId}/language`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error updating language:", error);
    return false;
  }
}

/**
 * Update security settings
 */
export async function updateSecurity(
  userId: string,
  payload: SecurityPayload
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/settings/${userId}/security`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    console.error("Error updating security settings:", error);
    return false;
  }
}
