import type { AgencyOrder, OrderStatus } from '@appTypes/agency';
import type { BackendAgencyOrder } from '@appTypes/agencyOrdersApi';
import { mapBackendAgencyOrder } from '@appTypes/agencyOrdersApi';
import type { ApiResponse } from '@appTypes/api';
import type { PaginatedItems } from '@appTypes/catalog';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

function unwrapOrders(
  data: BackendAgencyOrder[] | PaginatedItems<BackendAgencyOrder>,
): BackendAgencyOrder[] {
  return Array.isArray(data) ? data : (data.items ?? []);
}

export async function getAgencyOrders(): Promise<ApiResult<AgencyOrder[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendAgencyOrder[] | PaginatedItems<BackendAgencyOrder>>>(
        '/api/agencies/me/orders',
      )
      .then((response) =>
        unwrapOrders(unwrapApiResponse(response.data))
          .map(mapBackendAgencyOrder)
          .sort(
            (left, right) =>
              new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime(),
          ),
      ),
  );
}

export async function getAgencyOrder(orderId: string): Promise<ApiResult<AgencyOrder>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendAgencyOrder>>(`/api/agencies/me/orders/${orderId}`)
      .then((response) => mapBackendAgencyOrder(unwrapApiResponse(response.data))),
  );
}

export async function updateAgencyOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<ApiResult<AgencyOrder>> {
  return toApiResult(
    apiClient
      .patch<ApiResponse<BackendAgencyOrder>>(`/api/agencies/me/orders/${orderId}/status`, null, {
        params: { status },
      })
      .then((response) => mapBackendAgencyOrder(unwrapApiResponse(response.data))),
  );
}

export function formatOrderItemSummary(itemCount: number, totalAmount: number): string {
  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;
  return `${itemLabel} · GH₵ ${totalAmount.toLocaleString('en-GH')}`;
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}
