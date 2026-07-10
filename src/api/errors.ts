import axios, { AxiosError } from 'axios';

import type { ApiError } from '@appTypes/api';

export type AuthApiErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'SERVER'
  | 'UNKNOWN';

export interface NormalizedApiError {
  message: string;
  statusCode: number | null;
  code: AuthApiErrorCode;
  fieldErrors?: Record<string, string[]>;
}

interface BackendFieldError {
  field?: string;
  message?: string;
}

interface BackendErrorBody {
  success?: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: Record<string, string[]> | BackendFieldError[] | null;
  data?: unknown;
}

function normalizeFieldErrors(
  errors: BackendErrorBody['errors'],
): Record<string, string[]> | undefined {
  if (!errors) {
    return undefined;
  }

  if (Array.isArray(errors)) {
    const mapped: Record<string, string[]> = {};
    for (const entry of errors) {
      if (!entry.field || !entry.message) {
        continue;
      }
      mapped[entry.field] = [...(mapped[entry.field] ?? []), entry.message];
    }
    return Object.keys(mapped).length > 0 ? mapped : undefined;
  }

  return errors;
}

function mapStatusToCode(status: number | null): AuthApiErrorCode {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 400 || status === 422) return 'VALIDATION';
  if (status === 409) return 'CONFLICT';
  if (status === 429) return 'RATE_LIMIT';
  if (status !== null && status >= 500) return 'SERVER';
  return 'UNKNOWN';
}

function extractBackendMessage(data: BackendErrorBody | undefined, status: number | null): string {
  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  if (status === 401) {
    return 'Invalid email or password.';
  }

  if (status === 403) {
    return 'Your account has been deactivated. Contact support for help.';
  }

  if (status === 409) {
    return 'An account with this email already exists.';
  }

  if (status === 429) {
    return 'Too many attempts. Please try again later.';
  }

  if (status !== null && status >= 500) {
    return 'Something went wrong on our end. Please try again.';
  }

  return 'Something went wrong. Please try again.';
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorBody>;
    const status = axiosError.response?.status ?? null;

    if (axiosError.code === 'ECONNABORTED') {
      return {
        message: 'Request timed out. Check your connection and try again.',
        statusCode: null,
        code: 'TIMEOUT',
      };
    }

    if (!axiosError.response) {
      return {
        message: 'Unable to reach the server. Check your network and API URL.',
        statusCode: null,
        code: 'NETWORK',
      };
    }

    return {
      message: extractBackendMessage(axiosError.response.data, status),
      statusCode: status,
      code: mapStatusToCode(status),
      fieldErrors: normalizeFieldErrors(axiosError.response.data?.errors),
    };
  }

  if (error instanceof Error && error.message) {
    return {
      message: error.message,
      statusCode: null,
      code: 'UNKNOWN',
    };
  }

  return {
    message: 'Something went wrong. Please try again.',
    statusCode: null,
    code: 'UNKNOWN',
  };
}

export function toApiError(error: NormalizedApiError): ApiError {
  return {
    message: error.message,
    statusCode: error.statusCode ?? 0,
    errors: error.fieldErrors,
  };
}
