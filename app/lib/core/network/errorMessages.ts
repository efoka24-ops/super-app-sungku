const NETWORK_PATTERNS = [
  "failed to fetch",
  "networkerror",
  "network request failed",
  "load failed",
  "err_connection_refused",
  "err_name_not_resolved",
  "timeout",
  "fetch failed",
];

function looksLikeNetworkError(message: string): boolean {
  const normalized = message.toLowerCase();
  return NETWORK_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function toUserErrorMessage(error: unknown, fallback: string): string {
  const raw = error instanceof Error ? error.message : String(error || "");

  if (!raw || raw.trim().length === 0) {
    return fallback;
  }

  if (looksLikeNetworkError(raw)) {
    return "Service temporairement indisponible. Verifiez votre connexion puis reessayez.";
  }

  if (/^http\s*5\d\d$/i.test(raw.trim()) || raw.includes("HTTP 5")) {
    return "Le serveur rencontre un probleme temporaire. Reessayez dans quelques instants.";
  }

  if (/^http\s*4\d\d$/i.test(raw.trim()) || raw.includes("HTTP 4")) {
    return "Requete invalide ou session expiree. Verifiez vos informations puis reessayez.";
  }

  return raw;
}

export async function parseJsonSafe(response: Response): Promise<Record<string, unknown>> {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { message: raw };
  }
}
