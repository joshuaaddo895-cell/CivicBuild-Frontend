import type { ApiResponse } from '@appTypes/api';
import type { BackendCustomerOrder, CustomerOrder } from '@appTypes/customerOrdersApi';
import { mapBackendCustomerOrder } from '@appTypes/customerOrdersApi';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

export async function listCustomerOrders(): Promise<ApiResult<CustomerOrder[]>> {
  return toApiResult(
    apiClient.get<ApiResponse<BackendCustomerOrder[]>>('/api/orders').then((response) =>
      unwrapApiResponse(response.data)
        .map(mapBackendCustomerOrder)
        .sort(
          (left, right) => new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime(),
        ),
    ),
  );
}

export async function getCustomerOrder(orderId: string): Promise<ApiResult<CustomerOrder>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendCustomerOrder>>(`/api/orders/${orderId}`)
      .then((response) => mapBackendCustomerOrder(unwrapApiResponse(response.data))),
  );
}
