import { normalizeApiError, type NormalizedApiError } from './errors';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: NormalizedApiError };

export async function toApiResult<T>(promise: Promise<T>): Promise<ApiResult<T>> {
  try {
    const data = await promise;
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: normalizeApiError(error) };
  }
}
