import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

import { normalizeApiError } from '@api/errors';
import { getUploadTimeoutMs } from '@config/api';

/** React Native FormData may not always pass `instanceof FormData`. */
export function isMultipartBody(data: unknown): boolean {
  if (typeof FormData === 'undefined' || data == null) {
    return false;
  }

  if (data instanceof FormData) {
    return true;
  }

  return (
    typeof data === 'object' &&
    typeof (data as FormData).append === 'function' &&
    Array.isArray((data as { _parts?: unknown[] })._parts)
  );
}

/** Let axios/React Native set the multipart boundary — do not set Content-Type manually. */
export function getMultipartUploadConfig(): AxiosRequestConfig {
  return {
    timeout: getUploadTimeoutMs(),
    headers: {
      Accept: 'application/json',
      'Content-Type': undefined,
    },
    transformRequest: [(data: unknown) => data],
  };
}

export function logUploadFailure(context: string, error: unknown): void {
  if (!__DEV__) {
    return;
  }

  const normalized = normalizeApiError(error);
  const axiosError = axios.isAxiosError(error) ? error : null;

  console.error(`[upload] ${context}`, {
    url: axiosError?.config?.url,
    status: axiosError?.response?.status ?? normalized.statusCode,
    message: normalized.message,
    body: axiosError?.response?.data,
  });
}

export function normalizeProductUnit(unit: string): string {
  const trimmed = unit.trim();
  if (/^per\s+/i.test(trimmed)) {
    return trimmed;
  }

  return `per ${trimmed}`;
}
