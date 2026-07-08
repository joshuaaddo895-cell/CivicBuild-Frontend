import type { User } from '@appTypes/api';

import { formatUserDisplayName, parseDisplayName } from './mockAuth';

/**
 * Derives avatar initials from a user's name.
 * Two+ words: first letter of first + first letter of last (e.g. "Prinz Anaxy" → "PA").
 * Single word: first two letters uppercase (e.g. "Prinz" → "PR"), or one letter if shorter.
 */
export function getUserInitials(user: User | null, fallbackName?: string): string {
  if (!user && !fallbackName?.trim()) {
    return '?';
  }

  const firstName = user?.firstName?.trim() ?? '';
  const lastName = user?.lastName?.trim() ?? '';

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  const fullName = fallbackName?.trim() || formatUserDisplayName(user);
  const { firstName: parsedFirst, lastName: parsedLast } = parseDisplayName(fullName);

  if (parsedFirst && parsedLast) {
    return `${parsedFirst[0]}${parsedLast[0]}`.toUpperCase();
  }

  const single = parsedFirst || fullName.trim();
  if (single.length >= 2) {
    return single.slice(0, 2).toUpperCase();
  }

  return (single[0] ?? '?').toUpperCase();
}

export function isValidPaymentUrl(url: unknown): url is string {
  return typeof url === 'string' && url.trim().length > 0;
}
