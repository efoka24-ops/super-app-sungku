import API_CONFIG from "../../config";
import { Capacitor } from "@capacitor/core";

const API_BASE = `${API_CONFIG.BACKEND_URL.replace(/\/$/, "")}/api`;

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  email?: string;
  addedAt: string;
}

export interface ContactPayload {
  name: string;
  phoneNumber: string;
  avatar?: string;
  email?: string;
}

interface DeviceContactLike {
  name?: string[];
  tel?: string[];
}

/**
 * Fetch all contacts for a user
 */
export async function fetchContacts(userId: string): Promise<Contact[]> {
  try {
    const response = await fetch(`${API_BASE}/contacts/${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }
    const data = await response.json();
    return data.contacts || [];
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
}

/**
 * Add a new contact
 */
export async function addContact(
  userId: string,
  payload: ContactPayload
): Promise<Contact | null> {
  try {
    const response = await fetch(`${API_BASE}/contacts/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to add contact: ${response.statusText}`);
    }
    const data = await response.json();
    return data.contact;
  } catch (error) {
    console.error("Error adding contact:", error);
    return null;
  }
}

/**
 * Delete a contact
 */
export async function deleteContact(
  userId: string,
  contactId: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/contacts/${userId}/${contactId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting contact:", error);
    return false;
  }
}

/**
 * Request READ_CONTACTS permission on Android via Capacitor Contacts plugin.
 * Returns true if granted.
 */
async function requestContactsPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true;
  try {
    const { Contacts } = await import("@capacitor-community/contacts");
    const result = await Contacts.requestPermissions();
    return result.contacts === "granted";
  } catch {
    return false;
  }
}

/**
 * Read all contacts from the device using Capacitor Contacts plugin.
 * Falls back to the backend saved contacts list if permission denied or unavailable.
 */
export async function fetchDeviceOrSavedContacts(userId: string): Promise<Contact[]> {
  // Try Capacitor native contacts plugin (Android / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      const granted = await requestContactsPermission();
      if (!granted) {
        console.warn("Contacts permission denied, falling back to backend contacts");
        return fetchContacts(userId);
      }
      const { Contacts } = await import("@capacitor-community/contacts");
      const result = await Contacts.getContacts({
        projection: { name: true, phones: true }
      });
      const deviceContacts: Contact[] = [];
      for (const c of result.contacts) {
        const phones = c.phones ?? [];
        for (const phone of phones) {
          if (phone.number) {
            deviceContacts.push({
              id: `device_${c.contactId ?? Date.now()}_${deviceContacts.length}`,
              userId,
              name: [c.name?.given, c.name?.family].filter(Boolean).join(" ") || "Contact",
              phoneNumber: phone.number.replace(/\s+/g, ""),
              addedAt: new Date().toISOString()
            });
          }
        }
      }
      return deviceContacts;
    } catch (err) {
      console.warn("Capacitor Contacts error, falling back to backend contacts", err);
    }
  }

  // Web browser fallback: Contact Picker API (Chrome Android browser only)
  const nav = navigator as Navigator & {
    contacts?: {
      select: (props: string[], options?: { multiple?: boolean }) => Promise<DeviceContactLike[]>;
    };
  };
  if (nav.contacts?.select) {
    try {
      const picked = await nav.contacts.select(["name", "tel"], { multiple: true });
      return picked
        .filter((entry) => entry.tel?.[0])
        .map((entry, index) => ({
          id: `device_${index}_${Date.now()}`,
          userId,
          name: entry.name?.[0] || "Contact",
          phoneNumber: (entry.tel?.[0] || "").replace(/\s+/g, ""),
          addedAt: new Date().toISOString()
        }));
    } catch (err) {
      console.warn("Contact Picker API failed, falling back", err);
    }
  }

  // Final fallback: backend saved contacts
  return fetchContacts(userId);
}
