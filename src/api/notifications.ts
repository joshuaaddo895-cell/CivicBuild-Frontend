import type { ApiResponse } from '@appTypes/api';
import type { BackendNotification, PaginatedNotifications } from '@appTypes/notificationsApi';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

function unwrapNotifications(
  data: BackendNotification[] | PaginatedNotifications,
): BackendNotification[] {
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getNotifications(): Promise<ApiResult<BackendNotification[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendNotification[] | PaginatedNotifications>>('/api/notifications')
      .then((response) => unwrapNotifications(unwrapApiResponse(response.data))),
  );
}

export async function markNotificationRead(notificationId: string): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient
      .patch<ApiResponse<null>>(`/api/notifications/${notificationId}/read`)
      .then(() => null),
  );
}

export async function markAllNotificationsRead(): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient.patch<ApiResponse<null>>('/api/notifications/read-all').then(() => null),
  );
}

export function formatNotificationDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
