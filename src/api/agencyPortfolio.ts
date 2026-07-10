import type { ApiResponse } from '@appTypes/api';
import type { AgencyPortfolioUploadData, LocalUploadFile } from '@appTypes/verificationDocuments';
import { getMultipartUploadConfig } from '@utils/multipartUpload';
import { buildMultipartFormData } from '@utils/uploadValidation';

import { unwrapApiResponse } from './authTypes';
import apiClient from './client';
import { normalizeApiError, type NormalizedApiError } from './errors';

export type AgencyPortfolioApiResult<T> =
  { ok: true; data: T } | { ok: false; error: NormalizedApiError };

function multipartConfig() {
  return getMultipartUploadConfig();
}

export function getPortfolioUploadErrorMessage(error: NormalizedApiError): string {
  if (error.code === 'FORBIDDEN') {
    return "You don't have permission to upload portfolio images.";
  }

  if (error.statusCode === 400 || error.code === 'VALIDATION') {
    return error.message || 'Invalid image. Use JPG or PNG under 5MB.';
  }

  return error.message;
}

export async function uploadAgencyPortfolioImage(
  file: LocalUploadFile,
): Promise<AgencyPortfolioApiResult<AgencyPortfolioUploadData>> {
  try {
    const formData = buildMultipartFormData(file);
    const response = await apiClient.post<ApiResponse<AgencyPortfolioUploadData>>(
      '/api/agency/portfolio/upload',
      formData,
      multipartConfig(),
    );

    return { ok: true, data: unwrapApiResponse(response.data) };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}
