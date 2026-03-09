export function getItem<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string) {
  localStorage.removeItem(key);
}
