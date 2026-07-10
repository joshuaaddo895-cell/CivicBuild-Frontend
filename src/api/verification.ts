import type { ApiResponse } from '@appTypes/api';
import type {
  VerificationDocumentType,
  VerificationDocumentUploadData,
  VerificationDocumentUrlData,
  LocalUploadFile,
} from '@appTypes/verificationDocuments';
import { getMultipartUploadConfig } from '@utils/multipartUpload';
import { buildMultipartFormData } from '@utils/uploadValidation';

import { unwrapApiResponse } from './authTypes';
import apiClient from './client';
import { normalizeApiError, type NormalizedApiError } from './errors';

export type VerificationApiResult<T> =
  { ok: true; data: T } | { ok: false; error: NormalizedApiError };

function multipartConfig() {
  return getMultipartUploadConfig();
}

export function getVerificationUploadErrorMessage(error: NormalizedApiError): string {
  if (error.code === 'FORBIDDEN') {
    return "You don't have permission to upload this document.";
  }

  if (error.statusCode === 400 || error.code === 'VALIDATION') {
    return error.message || 'Invalid file. Use PDF, JPG, or PNG under 5MB.';
  }

  return error.message;
}

export function getVerificationViewErrorMessage(error: NormalizedApiError): string {
  if (error.code === 'FORBIDDEN') {
    return "You don't have permission to view this document.";
  }

  if (error.statusCode === 404) {
    return 'No document uploaded yet.';
  }

  return error.message;
}

export async function uploadVerificationDocument(
  documentType: VerificationDocumentType,
  file: LocalUploadFile,
): Promise<VerificationApiResult<VerificationDocumentUploadData>> {
  try {
    const formData = buildMultipartFormData(file);
    const response = await apiClient.post<ApiResponse<VerificationDocumentUploadData>>(
      '/api/verification/upload-document',
      formData,
      {
        ...multipartConfig(),
        params: { documentType },
      },
    );

    return { ok: true, data: unwrapApiResponse(response.data) };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}

export async function getVerificationDocumentUrl(
  userId: string,
  documentType: VerificationDocumentType,
): Promise<VerificationApiResult<VerificationDocumentUrlData>> {
  try {
    const response = await apiClient.get<ApiResponse<VerificationDocumentUrlData>>(
      `/api/verification/${userId}/document-url`,
      { params: { documentType } },
    );

    return { ok: true, data: unwrapApiResponse(response.data) };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}
