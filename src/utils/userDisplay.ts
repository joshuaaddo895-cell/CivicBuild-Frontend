import type { User } from '@appTypes/api';

export function parseDisplayName(
  displayName?: string,
  fallback = 'User',
): {
  firstName: string;
  lastName: string;
} {
  const trimmed = displayName?.trim() || fallback;
  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: fallback, lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export function formatUserDisplayName(user: User | null): string {
  if (!user) {
    return 'Guest User';
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.email;
}
