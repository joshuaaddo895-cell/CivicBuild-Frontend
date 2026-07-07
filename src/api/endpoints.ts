import type { ApiResponse, User } from '@appTypes/api';

import apiClient from './client';

// ─── Auth Endpoints (legacy barrel — prefer `@api/auth`) ─────────────────────
export const authApi = {
  verifyEmail: (token: string) =>
    apiClient.post<ApiResponse<null>>('/api/auth/verify-email', { token }),

  resendVerification: (email: string) =>
    apiClient.post<ApiResponse<null>>('/api/auth/resend-verification', { email }),
};

// ─── User Endpoints ───────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => apiClient.get<ApiResponse<User>>('/api/users/me'),

  updateProfile: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'avatar'>>) =>
    apiClient.patch<ApiResponse<User>>('/api/users/me', data),
};
