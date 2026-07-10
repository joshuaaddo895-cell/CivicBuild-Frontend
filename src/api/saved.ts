import type { ApiResponse } from '@appTypes/api';
import type { SavedItem } from '@appTypes/saved';
import type { BackendSavedItem, SaveItemRequest } from '@appTypes/savedApi';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

export function mapBackendSavedItem(item: BackendSavedItem): SavedItem {
  return {
    id: item.id,
    type: item.type,
    savedAt: item.savedAt,
  };
}

export async function getSavedItems(): Promise<ApiResult<SavedItem[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendSavedItem[]>>('/api/users/me/saved')
      .then((response) => unwrapApiResponse(response.data).map(mapBackendSavedItem)),
  );
}

export async function saveItem(input: SaveItemRequest): Promise<ApiResult<SavedItem>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendSavedItem>>('/api/users/me/saved', input)
      .then((response) => mapBackendSavedItem(unwrapApiResponse(response.data))),
  );
}

export async function removeSavedItem(
  type: SaveItemRequest['type'],
  id: string,
): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient.delete<ApiResponse<null>>(`/api/users/me/saved/${type}/${id}`).then(() => null),
  );
}
