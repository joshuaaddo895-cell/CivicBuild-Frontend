/** Validates Ghana phone numbers: 0XXXXXXXXX or +233XXXXXXXXX (9 digits after prefix). */
export function isValidGhanaPhone(phone: string): boolean {
  const normalized = phone.replace(/[\s-]/g, '');
  return /^(?:\+233|0)[2-9]\d{8}$/.test(normalized);
}

export function normalizeGhanaPhone(phone: string): string {
  const normalized = phone.replace(/[\s-]/g, '');
  if (normalized.startsWith('+233')) {
    return `0${normalized.slice(4)}`;
  }
  return normalized;
}

/** Formats a valid Ghana phone for backend delivery (e.g. +233201234567). */
export function formatGhanaPhoneInternational(phone: string): string {
  const normalized = phone.replace(/[\s-]/g, '');
  if (normalized.startsWith('+233')) {
    return normalized;
  }
  if (normalized.startsWith('0')) {
    return `+233${normalized.slice(1)}`;
  }
  return normalized;
}
