// Opérateurs Cameroun
export type Operator = 'orange' | 'mtn' | 'unknown';

export interface OperatorConfig {
  code: Operator;
  name: string;
  prefixes: string[];
  ussdCode: (phoneNumber: string, amount?: number) => string;
  shortCode: string;
}

const OPERATORS: Record<Operator, OperatorConfig> = {
  orange: {
    code: 'orange',
    name: 'Orange Cameroun',
    prefixes: ['65', '66', '67'],
    ussdCode: (phone: string, amount?: number) => {
      const amountPart = amount ? `*${amount}` : '';
      return `#150*1*1*1*${phone}${amountPart}#`;
    },
    shortCode: '150'
  },
  mtn: {
    code: 'mtn',
    name: 'MTN Cameroun',
    prefixes: ['68', '69'],
    ussdCode: (phone: string, amount?: number) => {
      const amountPart = amount ? `*${amount}` : '';
      return `*126*1*1*${phone}${amountPart}#`;
    },
    shortCode: '126'
  },
  unknown: {
    code: 'unknown',
    name: 'Opérateur inconnu',
    prefixes: [],
    ussdCode: () => '',
    shortCode: ''
  }
};

/**
 * Détecte l'opérateur basé sur le numéro de téléphone
 * @param phoneNumber - Numéro de téléphone (avec ou sans +237)
 * @returns Operator détecté
 */
export function detectOperator(phoneNumber: string): Operator {
  // Nettoyer le numéro
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Enlever le code pays si présent
  if (cleaned.startsWith('237')) {
    cleaned = cleaned.substring(3);
  }
  
  // Obtenir les 2 premiers chiffres
  const prefix = cleaned.substring(0, 2);
  
  if (OPERATORS.orange.prefixes.includes(prefix)) {
    return 'orange';
  }
  if (OPERATORS.mtn.prefixes.includes(prefix)) {
    return 'mtn';
  }
  
  return 'unknown';
}

/**
 * Obtient la configuration d'un opérateur
 */
export function getOperatorConfig(operator: Operator): OperatorConfig {
  return OPERATORS[operator];
}

/**
 * Génère le code USSD complet
 * @param operator - L'opérateur (orange | mtn)
 * @param phoneNumber - Le numéro de téléphone du destinataire
 * @param amount - Le montant optionnel en FCFA
 */
export function generateUSSDCode(operator: Operator, phoneNumber: string, amount?: number): string {
  const config = getOperatorConfig(operator);
  return config.ussdCode(phoneNumber, amount);
}

/**
 * Valide un numéro de téléphone camerounais
 */
export function isValidCameroonNumber(phoneNumber: string): boolean {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Doit être 9 chiffres après le code pays, ou 12 avec code pays
  if (cleaned.length === 9 || (cleaned.length === 12 && cleaned.startsWith('237'))) {
    return true;
  }
  
  return false;
}

/**
 * Formate un numéro camerounais en format standard
 */
export function formatCameroonNumber(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `+237 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('237')) {
    const localNumber = cleaned.substring(3);
    return `+237 ${localNumber.substring(0, 2)} ${localNumber.substring(2, 5)} ${localNumber.substring(5)}`;
  }
  
  return phoneNumber;
}

/**
 * Extrait juste le numéro local (9 chiffres)
 */
export function extractLocalNumber(phoneNumber: string): string {
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 12 && cleaned.startsWith('237')) {
    return cleaned.substring(3);
  }
  
  if (cleaned.length === 9) {
    return cleaned;
  }
  
  return cleaned;
}
