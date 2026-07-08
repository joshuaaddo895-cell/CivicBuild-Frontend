import type { CartItem, CheckoutFormData } from '@appTypes/cart';

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

/** Frontend checkout payload (cart + customer form). */
export interface CheckoutRequest {
  items: CartItem[];
  subtotal: number;
  total: number;
  currency: 'GHS';
  customer: CheckoutFormData;
}

/** Normalized checkout init result used by navigation + WebView. */
export interface CheckoutInitializeResponse {
  orderId: string;
  orderNumber: string;
  reference: string;
  authorizationUrl: string;
  amountInPesewas?: number;
}

export interface OrderConfirmationDetails {
  orderId: string;
  orderNumber: string;
  amountPaid: number;
  amountLabel: string;
  deliveryAddress: string;
}

// ─── Backend DTOs (Spring Boot / Postman contract) ────────────────────────────

export interface BackendOrderItem {
  productName: string;
  supplierName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
}

export interface BackendDeliveryDetails {
  address: string;
  city: string;
  region: string;
  phoneNumber: string;
}

export interface BackendCheckoutRequest {
  items: BackendOrderItem[];
  delivery: BackendDeliveryDetails;
}

export interface BackendCheckoutResponse {
  orderId?: string;
  order_id?: string;
  authorizationUrl?: string;
  authorization_url?: string;
  paystackReference?: string;
  paystack_reference?: string;
  orderNumber?: string;
  order_number?: string;
  totalAmount?: number;
  amountInPesewas?: number;
}

export interface OrderDetails {
  orderId: string;
  orderNumber?: string;
  status: OrderStatus;
  totalAmount?: number;
  paystackReference?: string;
}
