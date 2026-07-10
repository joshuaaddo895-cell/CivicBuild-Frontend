import type { User } from '@appTypes/api';

import { resolveAuthSession, type AuthSession } from './authSession';
import {
  mapRegisterDataToUser,
  unwrapApiResponse,
  type AuthResult,
  type BackendAuthTokens,
  type BackendRegisterData,
} from './authTypes';
import apiClient from './client';
import { normalizeApiError } from './errors';

export type { AuthSession } from './authSession';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface RegisterResult {
  user: User;
  message: string;
}

export interface MessageResult {
  message: string;
}

async function toAuthResult<T>(promise: Promise<T>): Promise<AuthResult<T>> {
  try {
    const data = await promise;
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}

export async function register(input: RegisterInput): Promise<AuthResult<RegisterResult>> {
  return toAuthResult(
    apiClient
      .post<{ success: boolean; message: string; data: BackendRegisterData }>(
        '/api/auth/register',
        {
          fullName: input.fullName.trim(),
          email: input.email.trim(),
          password: input.password,
        },
      )
      .then((response) => {
        const data = unwrapApiResponse(response.data);
        return {
          user: mapRegisterDataToUser(data),
          message: response.data.message,
        };
      }),
  );
}

export async function login(input: LoginInput): Promise<AuthResult<AuthSession>> {
  return toAuthResult(
    apiClient
      .post<{ success: boolean; message: string; data: BackendAuthTokens }>('/api/auth/login', {
        email: input.email.trim(),
        password: input.password,
      })
      .then(async (response) => {
        const data = unwrapApiResponse(response.data);
        return resolveAuthSession(data, input.email.trim());
      }),
  );
}

export async function logout(refreshToken: string): Promise<AuthResult<MessageResult>> {
  return toAuthResult(
    apiClient
      .post<{ success: boolean; message: string; data: null }>('/api/auth/logout', {
        refreshToken,
      })
      .then((response) => ({
        message: response.data.message || 'Signed out successfully.',
      })),
  );
}

export async function refreshToken(
  refreshTokenValue: string,
): Promise<AuthResult<Pick<AuthSession, 'accessToken' | 'refreshToken'>>> {
  return toAuthResult(
    apiClient
      .post<{ success: boolean; message: string; data: BackendAuthTokens }>('/api/auth/refresh', {
        refreshToken: refreshTokenValue,
      })
      .then((response) => {
        const data = unwrapApiResponse(response.data);
        return {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        };
      }),
  );
}

export async function forgotPassword(email: string): Promise<AuthResult<MessageResult>> {
  return toAuthResult(
    apiClient
      .post<{ success: boolean; message: string; data: null }>('/api/auth/forgot-password', {
        email: email.trim(),
      })
      .then((response) => ({
        message: response.data.message,
      })),
  );
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<AuthResult<MessageResult>> {
  return toAuthResult(
    apiClient
      .post<{ success: boolean; message: string; data: null }>('/api/auth/change-password', {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      })
      .then((response) => ({
        message: response.data.message || 'Password updated successfully.',
      })),
  );
}

export async function resetPassword(input: ResetPasswordInput): Promise<AuthResult<MessageResult>> {
  return toAuthResult(
    apiClient
      .post<{ success: boolean; message: string; data: null }>('/api/auth/reset-password', {
        token: input.token,
        newPassword: input.newPassword,
      })
      .then((response) => ({
        message: response.data.message,
      })),
  );
}

export async function googleSignIn(idToken: string): Promise<AuthResult<AuthSession>> {
  return toAuthResult(
    apiClient
      .post<{ success: boolean; message: string; data: BackendAuthTokens }>('/api/auth/google', {
        idToken,
      })
      .then(async (response) => {
        const data = unwrapApiResponse(response.data);
        return resolveAuthSession(data);
      }),
  );
}
