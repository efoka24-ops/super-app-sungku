import API_CONFIG from "../../config";

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
