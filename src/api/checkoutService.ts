import { unwrapApiResponse } from '@api/authTypes';
import { normalizeApiError } from '@api/errors';
import type { CheckoutRequest, CheckoutInitializeResponse, OrderDetails } from '@appTypes/order';
import { mockInitializeCheckout, shouldUseMockCheckout } from '@utils/mockCheckout';
import { mapBackendCheckoutResponse, toBackendCheckoutRequest } from '@utils/orderMappers';

import { ordersApi } from './orders';

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutError';
  }
}

export async function initializeCheckout(
  payload: CheckoutRequest,
): Promise<CheckoutInitializeResponse> {
  if (shouldUseMockCheckout()) {
    return mockInitializeCheckout(payload);
  }

  try {
    const response = await ordersApi.checkout(toBackendCheckoutRequest(payload));
    const data = unwrapApiResponse(response.data);
    return mapBackendCheckoutResponse(data, payload.total);
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw new CheckoutError(error.message);
    }
    const normalized = normalizeApiError(error);
    throw new CheckoutError(normalized.message);
  }
}

export async function verifyOrderPayment(orderId: string): Promise<OrderDetails> {
  try {
    const response = await ordersApi.verifyPayment(orderId);
    return unwrapApiResponse(response.data);
  } catch (error) {
    const normalized = normalizeApiError(error);
    throw new CheckoutError(normalized.message);
  }
}

export async function getOrder(orderId: string): Promise<OrderDetails> {
  try {
    const response = await ordersApi.getOrder(orderId);
    return unwrapApiResponse(response.data);
  } catch (error) {
    const normalized = normalizeApiError(error);
    throw new CheckoutError(normalized.message);
  }
}

export async function listMyOrders(): Promise<OrderDetails[]> {
  try {
    const response = await ordersApi.listOrders();
    return unwrapApiResponse(response.data);
  } catch (error) {
    const normalized = normalizeApiError(error);
    throw new CheckoutError(normalized.message);
  }
}
