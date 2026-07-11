import type { ApiResponse } from '@appTypes/api';
import type {
  BackendDeliveryJob,
  BackendDeliveryProvider,
  DeliveryJobStatus,
  DeliveryProviderSetupInput,
} from '@appTypes/deliveryApi';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

export async function setupDeliveryProvider(
  input: DeliveryProviderSetupInput,
): Promise<ApiResult<BackendDeliveryProvider>> {
  return toApiResult(
    apiClient
      .post<ApiResponse<BackendDeliveryProvider>>('/api/delivery-providers/setup', input)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function getMyDeliveryProvider(): Promise<ApiResult<BackendDeliveryProvider>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendDeliveryProvider>>('/api/delivery-providers/me')
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function updateMyDeliveryProvider(
  input: DeliveryProviderSetupInput,
): Promise<ApiResult<BackendDeliveryProvider>> {
  return toApiResult(
    apiClient
      .patch<ApiResponse<BackendDeliveryProvider>>('/api/delivery-providers/me', input)
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function removeDeliveryAssociation(): Promise<ApiResult<null>> {
  return toApiResult(
    apiClient.delete<ApiResponse<null>>('/api/delivery-providers/me/association').then(() => null),
  );
}

export async function getMyDeliveryJobs(): Promise<ApiResult<BackendDeliveryJob[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendDeliveryJob[]>>('/api/delivery-providers/me/jobs')
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function updateDeliveryJobStatus(
  jobId: string,
  status: DeliveryJobStatus,
): Promise<ApiResult<BackendDeliveryJob>> {
  return toApiResult(
    apiClient
      .patch<ApiResponse<BackendDeliveryJob>>(
        `/api/delivery-providers/me/jobs/${jobId}/status`,
        null,
        {
          params: { status },
        },
      )
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export function getDeliveryJobStatusLabel(status: DeliveryJobStatus): string {
  switch (status) {
    case 'assigned':
      return 'Assigned';
    case 'in_transit':
      return 'In Transit';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}
