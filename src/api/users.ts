import type { ApiResponse, User } from '@appTypes/api';
import type { LocalUploadFile } from '@appTypes/verificationDocuments';
import { getMultipartUploadConfig } from '@utils/multipartUpload';
import { buildMultipartFormData } from '@utils/uploadValidation';

import { toUploadApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';
import { normalizeApiError, type NormalizedApiError } from './errors';
import { mapBackendUserResponse, type BackendUserResponse } from './userMappers';

export type { BackendUserResponse } from './userMappers';
export { mapBackendUserResponse } from './userMappers';

export interface UpdateProfileInput {
  fullName?: string;
  profilePictureUrl?: string;
}

export type UserProfileResult<T> = { ok: true; data: T } | { ok: false; error: NormalizedApiError };

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
  return toUploadApiResult(
    apiClient
      .post<ApiResponse<{ profilePictureUrl: string }>>(
        '/api/users/me/avatar',
        buildMultipartFormData(file),
        getMultipartUploadConfig(),
      )
      .then((response) => unwrapApiResponse(response.data)),
    'avatar',
  );
}
