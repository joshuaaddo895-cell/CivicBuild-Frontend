import type { CartItem, CheckoutFormData } from '@appTypes/cart';

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface CheckoutRequest {
  items: CartItem[];
  subtotal: number;
  total: number;
  currency: 'GHS';
  customer: CheckoutFormData;
}

export interface CheckoutInitializeResponse {
  orderId: string;
  orderNumber: string;
  reference: string;
  authorizationUrl: string;
  amountInPesewas: number;
}

export interface OrderConfirmationDetails {
  orderId: string;
  orderNumber: string;
  amountPaid: number;
  amountLabel: string;
  deliveryAddress: string;
}
