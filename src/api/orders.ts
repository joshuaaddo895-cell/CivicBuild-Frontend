import type { ApiResponse } from '@appTypes/api';
import type { CheckoutRequest, CheckoutInitializeResponse } from '@appTypes/order';

import apiClient from './client';

export const ordersApi = {
  checkout: (data: CheckoutRequest) =>
    apiClient.post<ApiResponse<CheckoutInitializeResponse>>('/orders/checkout', data),
};
