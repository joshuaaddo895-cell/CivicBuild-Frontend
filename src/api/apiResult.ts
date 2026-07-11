import { logUploadFailure } from '@utils/multipartUpload';

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

export async function toUploadApiResult<T>(
  promise: Promise<T>,
  context: string,
): Promise<ApiResult<T>> {
  try {
    const data = await promise;
    return { ok: true, data };
  } catch (error) {
    logUploadFailure(context, error);
    return { ok: false, error: normalizeApiError(error) };
  }
}
