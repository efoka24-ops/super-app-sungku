import API_CONFIG from "../../config";

const API_BASE = `${API_CONFIG.BACKEND_URL.replace(/\/$/, "")}/api`;

export interface MiniApp {
  id: string;
  appId: string;
  userId: string;
  name: string;
  icon: string;
  category: string;
  installedAt: string;
}

/**
 * Fetch installed mini-apps for a user
 */
export async function fetchInstalledMiniApps(userId: string): Promise<MiniApp[]> {
  try {
    const response = await fetch(`${API_BASE}/miniapps/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch mini-apps: ${response.statusText}`);
    }
    const data = await response.json();
    return data.miniapps || [];
  } catch (error) {
    console.error("Error fetching mini-apps:", error);
    return [];
  }
}

/**
 * Install a mini-app
 */
export async function installMiniApp(
  userId: string,
  appId: string
): Promise<MiniApp | null> {
  try {
    const response = await fetch(`${API_BASE}/miniapps/${userId}/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId }),
    });
    if (!response.ok) {
      throw new Error(`Failed to install mini-app: ${response.statusText}`);
    }
    const data = await response.json();
    return data.miniapp;
  } catch (error) {
    console.error("Error installing mini-app:", error);
    return null;
  }
}

/**
 * Uninstall a mini-app
 */
export async function uninstallMiniApp(
  userId: string,
  appId: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/miniapps/${userId}/${appId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error uninstalling mini-app:", error);
    return false;
  }
}
