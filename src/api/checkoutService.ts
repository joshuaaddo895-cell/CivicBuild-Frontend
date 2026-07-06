import type { CheckoutRequest, CheckoutInitializeResponse } from '@appTypes/order';
import { mockInitializeCheckout, shouldUseMockCheckout } from '@utils/mockCheckout';

import { ordersApi } from './orders';

export async function initializeCheckout(
  payload: CheckoutRequest,
): Promise<CheckoutInitializeResponse> {
  if (shouldUseMockCheckout()) {
    return mockInitializeCheckout(payload);
  }

  try {
    const response = await ordersApi.checkout(payload);
    return response.data.data;
  } catch {
    return mockInitializeCheckout(payload);
  }
}
