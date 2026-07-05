import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '@appTypes/api';

import apiClient from './client';

// ─── Auth Endpoints ───────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginRequest) => apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  logout: () => apiClient.post<ApiResponse<null>>('/auth/logout'),

  verifyEmail: (token: string) =>
    apiClient.post<ApiResponse<null>>('/auth/verify-email', { token }),

  resendVerification: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/resend-verification', { email }),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    }),
};

// ─── User Endpoints ───────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => apiClient.get<ApiResponse<User>>('/users/me'),

  updateProfile: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'avatar'>>) =>
    apiClient.patch<ApiResponse<User>>('/users/me', data),
};
