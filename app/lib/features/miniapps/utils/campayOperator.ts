/**
 * Détection d'opérateur Cameroun pour CamPay (spec Sungku Send)
 * MTN   : 650–659, 670–679
 * Orange: 655–657 (prioritaire), 690–699
 * Yoomee: préfixe local 242
 * Blue  : préfixe local 233
 */

export type CamPayOperator = "MTN" | "ORANGE" | "YOOMEE" | "BLUE" | "UNKNOWN";

export interface OperatorInfo {
  code: CamPayOperator;
  name: string;
  color: string;
  badgeClass: string;
  emoji: string;
}

export const OPERATOR_INFO: Record<CamPayOperator, OperatorInfo> = {
  MTN: {
    code: "MTN",
    name: "MTN MoMo",
    color: "#FFC300",
    badgeClass: "bg-yellow-400 text-yellow-900",
    emoji: "🟡",
  },
  ORANGE: {
    code: "ORANGE",
    name: "Orange Money",
    color: "#FF6600",
    badgeClass: "bg-orange-500 text-white",
    emoji: "🟠",
  },
  YOOMEE: {
    code: "YOOMEE",
    name: "Yoomee",
    color: "#0066CC",
    badgeClass: "bg-blue-500 text-white",
    emoji: "🔵",
  },
  BLUE: {
    code: "BLUE",
    name: "Blue",
    color: "#004E8C",
    badgeClass: "bg-blue-900 text-white",
    emoji: "💙",
  },
  UNKNOWN: {
    code: "UNKNOWN",
    name: "Inconnu",
    color: "#9CA3AF",
    badgeClass: "bg-gray-200 text-gray-600",
    emoji: "❓",
  },
};

/** Normalise un numéro camerounais au format 237XXXXXXXXX */
export function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("237") && d.length === 12) return d;
  if (d.startsWith("6") && d.length === 9) return `237${d}`;
  if (d.length === 9) return `237${d}`;
  return d;
}

export function isValidCamPhone(raw: string): boolean {
  return /^237[0-9]{9}$/.test(normalizePhone(raw));
}

/** Détecte l'opérateur selon les préfixes officiels Cameroun */
export function detectCamPayOperator(raw: string): CamPayOperator {
  const n = normalizePhone(raw);
  if (!n.startsWith("237") || n.length !== 12) return "UNKNOWN";

  const local = n.slice(3); // 9 chiffres : 6XXXXXXXX
  const p3 = parseInt(local.slice(0, 3));

  // Orange prioritaire sur 655–657 (chevauche MTN 650–659)
  if (p3 >= 655 && p3 <= 657) return "ORANGE";
  if (p3 >= 690 && p3 <= 699) return "ORANGE";

  // MTN
  if (p3 >= 650 && p3 <= 659) return "MTN";
  if (p3 >= 670 && p3 <= 679) return "MTN";

  // Yoomee
  if (local.startsWith("242")) return "YOOMEE";

  // Blue
  if (local.startsWith("233")) return "BLUE";

  return "UNKNOWN";
}

/** Masque le numéro : 237 6XX XXX XX */
export function maskPhone(raw: string): string {
  const n = normalizePhone(raw);
  if (n.startsWith("237") && n.length === 12) {
    const d = n.slice(3);
    return `237 ${d[0]}XX XXX ${d.slice(6)}`;
  }
  return raw;
}

/** Formate pour affichage : +237 6 XX XXX XX */
export function formatPhoneDisplay(raw: string): string {
  const n = normalizePhone(raw);
  if (n.startsWith("237") && n.length === 12) {
    const d = n.slice(3);
    return `+237 ${d[0]} ${d.slice(1, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return raw;
}
