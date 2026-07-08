import type { ApiResponse } from '@appTypes/api';
import type {
  BackendCheckoutRequest,
  BackendCheckoutResponse,
  OrderDetails,
} from '@appTypes/order';

import apiClient from './client';

export const ordersApi = {
  checkout: (data: BackendCheckoutRequest) =>
    apiClient.post<ApiResponse<BackendCheckoutResponse>>('/api/orders/checkout', data),

  verifyPayment: (orderId: string) =>
    apiClient.post<ApiResponse<OrderDetails>>(`/api/orders/${orderId}/verify`),

  getOrder: (orderId: string) => apiClient.get<ApiResponse<OrderDetails>>(`/api/orders/${orderId}`),

  listOrders: () => apiClient.get<ApiResponse<OrderDetails[]>>('/api/orders'),
};
