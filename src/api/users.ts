import type { ApiResponse, User } from '@appTypes/api';
import type { LocalUploadFile } from '@appTypes/verificationDocuments';
import { buildMultipartFormData } from '@utils/uploadValidation';
import { parseDisplayName } from '@utils/userDisplay';

import { toApiResult, type ApiResult } from './apiResult';
import { mapBackendUserToUser, unwrapApiResponse } from './authTypes';
import apiClient from './client';
import { normalizeApiError, type NormalizedApiError } from './errors';

export interface BackendUserResponse {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  verificationStatus?: string;
  active?: boolean;
  profilePictureUrl?: string | null;
  createdAt?: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  profilePictureUrl?: string;
}

export type UserProfileResult<T> = { ok: true; data: T } | { ok: false; error: NormalizedApiError };

export function mapBackendUserResponse(data: BackendUserResponse, current?: User | null): User {
  const email = data.email || current?.email || '';
  const { firstName, lastName } = parseDisplayName(
    data.fullName,
    current ? `${current.firstName} ${current.lastName}`.trim() : email.split('@')[0] || 'User',
  );

  const mapped = mapBackendUserToUser(
    {
      id: data.id,
      email,
      fullName: data.fullName,
      role: data.role,
      verificationStatus: data.verificationStatus,
    },
    email,
  );

  return {
    ...mapped,
    firstName,
    lastName,
    avatar: data.profilePictureUrl ?? current?.avatar,
    createdAt: data.createdAt ?? current?.createdAt ?? mapped.createdAt,
    updatedAt: new Date().toISOString(),
  };
}

export async function getProfile(): Promise<UserProfileResult<User>> {
  try {
    const response = await apiClient.get<ApiResponse<BackendUserResponse>>('/api/users/me');
    const data = unwrapApiResponse(response.data);
    return { ok: true, data: mapBackendUserResponse(data) };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}

export async function updateProfile(
  input: UpdateProfileInput,
  currentUser: User,
): Promise<UserProfileResult<User>> {
  try {
    const payload: Record<string, string> = {};

    if (input.fullName !== undefined) {
      payload.fullName = input.fullName.trim();
    }

    if (input.profilePictureUrl !== undefined) {
      payload.profilePictureUrl = input.profilePictureUrl;
    }

    const response = await apiClient.patch<ApiResponse<BackendUserResponse>>(
      '/api/users/me',
      payload,
    );
    const data = unwrapApiResponse(response.data);
    return { ok: true, data: mapBackendUserResponse(data, currentUser) };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}

/** @deprecated Use updateProfile({ profilePictureUrl }) */
export async function updateProfilePicture(
  profilePictureUrl: string,
  currentUser: User,
): Promise<UserProfileResult<User>> {
  return updateProfile({ profilePictureUrl }, currentUser);
}

export async function uploadAvatar(
  file: LocalUploadFile,
): Promise<ApiResult<{ profilePictureUrl: string }>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<{ profilePictureUrl: string }>>(
        '/api/users/me/avatar',
        buildMultipartFormData(file),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      .then((response) => unwrapApiResponse(response.data)),
  );
}
