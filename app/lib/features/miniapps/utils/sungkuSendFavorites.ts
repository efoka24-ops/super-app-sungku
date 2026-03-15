import type { Contact } from "../../contacts/contactsApi";

export interface FavoriteContact {
  id: string;
  name: string;
  phoneNumber: string;
  addedAt: string;
}

function storageKey(userId: string) {
  return `sungku_send_favorites_${userId}`;
}

export function getFavorites(userId: string): FavoriteContact[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFavorite(userId: string, phoneNumber: string): boolean {
  const normalized = phoneNumber.replace(/\D/g, "");
  return getFavorites(userId).some((f) => f.phoneNumber.replace(/\D/g, "") === normalized);
}

export function toggleFavorite(userId: string, contact: Contact): FavoriteContact[] {
  const favorites = getFavorites(userId);
  const normalized = contact.phoneNumber.replace(/\D/g, "");
  const idx = favorites.findIndex((f) => f.phoneNumber.replace(/\D/g, "") === normalized);

  if (idx >= 0) {
    favorites.splice(idx, 1);
  } else {
    favorites.unshift({
      id: contact.id,
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      addedAt: new Date().toISOString(),
    });
  }

  const trimmed = favorites.slice(0, 12);
  localStorage.setItem(storageKey(userId), JSON.stringify(trimmed));
  return trimmed;
}
