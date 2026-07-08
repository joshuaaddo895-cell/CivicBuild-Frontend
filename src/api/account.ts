import apiClient from './client';
import { normalizeApiError, type NormalizedApiError } from './errors';

export interface DeleteAccountResult {
  message: string;
}

export type AccountResult<T> = { ok: true; data: T } | { ok: false; error: NormalizedApiError };

interface DeleteAccountResponse {
  success: boolean;
  message: string;
  timestamp?: string;
}

export async function deleteAccount(): Promise<AccountResult<DeleteAccountResult>> {
  try {
    const response = await apiClient.delete<DeleteAccountResponse>('/api/account');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete account.');
    }

    return {
      ok: true,
      data: { message: response.data.message || 'Account deleted successfully' },
    };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}
