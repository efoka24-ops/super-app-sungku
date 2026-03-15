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

/** Collect device info and geolocation for KPI */
async function collectDeviceMeta(): Promise<Record<string, string>> {
  const meta: Record<string, string> = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: String(screen.width),
    screenHeight: String(screen.height),
    deviceMemory: String((navigator as any).deviceMemory ?? ""),
    connection: (navigator as any).connection?.effectiveType ?? "",
    installTime: new Date().toISOString(),
  };
  try {
    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          meta.latitude = String(pos.coords.latitude);
          meta.longitude = String(pos.coords.longitude);
          meta.locationAccuracy = String(pos.coords.accuracy);
          resolve();
        },
        () => resolve(),
        { timeout: 3000 }
      );
    });
  } catch {
    // location optional
  }
  return meta;
}

/**
 * Install a mini-app and send device/location KPI
 */
export async function installMiniApp(
  userId: string,
  appId: string,
  phone?: string
): Promise<MiniApp | null> {
  const deviceMeta = await collectDeviceMeta();
  try {
    const response = await fetch(`${API_BASE}/miniapps/${userId}/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId, phone, deviceMeta }),
    });
    if (!response.ok) {
      throw new Error(`Failed to install mini-app: ${response.statusText}`);
    }
    const data = await response.json();
    // Keep localStorage in sync for profile stats
    try {
      const current: string[] = JSON.parse(localStorage.getItem("installedApps") || "[]");
      if (!current.includes(appId)) {
        current.push(appId);
        localStorage.setItem("installedApps", JSON.stringify(current));
      }
    } catch {
      // ignore
    }
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
