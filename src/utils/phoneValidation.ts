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
