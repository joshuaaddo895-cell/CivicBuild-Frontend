import type { User } from '@appTypes/api';

const MOCK_ACCESS_TOKEN = 'mock-access-token';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token';

export function parseDisplayName(
  displayName?: string,
  fallback = 'Demo',
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

export function createMockUser(email = 'demo@civicbuild.com', displayName?: string): User {
  const localPart = email.split('@')[0]?.trim() || 'demo';
  const { firstName, lastName } = parseDisplayName(displayName, localPart);

  return {
    id: 'mock-user-id',
    email: email || 'demo@civicbuild.com',
    firstName,
    lastName,
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function resolveDemoEmail(email?: string): string {
  const trimmed = email?.trim();
  return trimmed && trimmed.includes('@') ? trimmed : 'demo@civicbuild.com';
}

export function getMockAuthTokens() {
  return {
    accessToken: MOCK_ACCESS_TOKEN,
    refreshToken: MOCK_REFRESH_TOKEN,
  };
}

export function isMockAccessToken(token: string | null): boolean {
  return token === MOCK_ACCESS_TOKEN;
}

export function formatUserDisplayName(user: User | null): string {
  if (!user) {
    return 'Guest User';
  }

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.email;
}
