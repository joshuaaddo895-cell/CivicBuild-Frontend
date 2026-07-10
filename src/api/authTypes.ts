import type { ApiResponse, User } from '@appTypes/api';
import { parseDisplayName } from '@utils/userDisplay';

import type { NormalizedApiError } from './errors';

export interface BackendAuthUser {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  verificationStatus?: string;
}

export interface BackendAuthTokens {
  accessToken: string;
  refreshToken: string;
  user?: BackendAuthUser;
}

export interface BackendRegisterData {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

function mapBackendRole(role?: string): User['role'] {
  const normalized = role?.trim().toUpperCase();
  if (normalized === 'ADMIN') return 'admin';
  if (normalized === 'MODERATOR') return 'moderator';
  return 'user';
}

export function mapBackendUserToUser(backendUser: BackendAuthUser, fallbackEmail?: string): User {
  const email = backendUser.email || fallbackEmail || '';
  const { firstName, lastName } = parseDisplayName(
    backendUser.fullName,
    email.split('@')[0] || 'User',
  );

  return {
    id: backendUser.id,
    email,
    firstName,
    lastName,
    role: mapBackendRole(backendUser.role),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function mapRegisterDataToUser(data: BackendRegisterData): User {
  return mapBackendUserToUser(
    {
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    },
    data.email,
  );
}

export function mapAuthTokensToUser(tokens: BackendAuthTokens, fallbackEmail?: string): User {
  if (tokens.user?.id) {
    return mapBackendUserToUser(tokens.user, fallbackEmail);
  }

  throw new Error('Auth token response did not include a user. Fetch /api/users/me instead.');
}

export type AuthResult<T> = { ok: true; data: T } | { ok: false; error: NormalizedApiError };

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || 'Request failed.');
  }

  return response.data;
}
