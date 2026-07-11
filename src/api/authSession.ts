import axios from 'axios';

import type { User } from '@appTypes/api';
import { getApiBaseUrl, getApiTimeoutMs } from '@config/api';

import { mapBackendUserToUser, unwrapApiResponse, type BackendAuthTokens } from './authTypes';
import { mapBackendUserResponse, type BackendUserResponse } from './userMappers';

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const INVALID_USER_IDS = new Set(['unknown-user', 'mock-user-id']);

export function isPersistableUserId(userId: string | null | undefined): userId is string {
  return Boolean(userId && !INVALID_USER_IDS.has(userId));
}

async function fetchAuthenticatedUser(accessToken: string, fallbackEmail?: string): Promise<User> {
  const response = await axios.get<{
    success: boolean;
    data: BackendUserResponse;
    message: string;
  }>(`${getApiBaseUrl()}/api/users/me`, {
    timeout: getApiTimeoutMs(),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  const data = unwrapApiResponse(response.data);
  return mapBackendUserResponse(
    data,
    fallbackEmail
      ? mapBackendUserToUser({
          id: data.id,
          email: fallbackEmail,
          fullName: fallbackEmail.split('@')[0],
        })
      : null,
  );
}

/** Resolve the authenticated user from token payload or `/api/users/me`. */
export async function resolveAuthSession(
  tokens: BackendAuthTokens,
  fallbackEmail?: string,
): Promise<AuthSession> {
  let user: User | null = null;

  if (tokens.user?.id && isPersistableUserId(tokens.user.id)) {
    user = mapBackendUserToUser(tokens.user, fallbackEmail);
  } else {
    user = await fetchAuthenticatedUser(tokens.accessToken, fallbackEmail);
  }

  if (!isPersistableUserId(user.id)) {
    throw new Error('Unable to resolve authenticated user from the server.');
  }

  return {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}
