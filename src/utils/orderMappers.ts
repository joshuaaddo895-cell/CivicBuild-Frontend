import type { CartItem, CheckoutFormData } from '@appTypes/cart';
import type {
  BackendCheckoutRequest,
  BackendCheckoutResponse,
  BackendDeliveryDetails,
  BackendOrderItem,
  CheckoutInitializeResponse,
  CheckoutRequest,
} from '@appTypes/order';
import { cedisToPesewas } from '@utils/paystackAmount';
import { formatGhanaPhoneInternational } from '@utils/phoneValidation';
import { isValidPaymentUrl } from '@utils/userInitials';

const DEFAULT_SUPPLIER_NAME = 'CivicBuild Supplier';
const DEFAULT_UNIT = 'unit';

function mapCartItemToBackendItem(item: CartItem): BackendOrderItem {
  return {
    productId: item.productId,
    productName: item.name.trim(),
    supplierName: (item.supplierName ?? DEFAULT_SUPPLIER_NAME).trim(),
    unitPrice: item.price,
    quantity: item.quantity,
    unit: (item.unit ?? DEFAULT_UNIT).trim(),
  };
}

function mapCustomerToDelivery(customer: CheckoutFormData): BackendDeliveryDetails {
  return {
    address: customer.streetAddress.trim(),
    city: customer.city.trim(),
    region: customer.region.trim(),
    phoneNumber: formatGhanaPhoneInternational(customer.phone),
  };
}

export function toBackendCheckoutRequest(payload: CheckoutRequest): BackendCheckoutRequest {
  return {
    items: payload.items.map(mapCartItemToBackendItem),
    delivery: mapCustomerToDelivery(payload.customer),
  };
}

export function mapBackendCheckoutResponse(
  data: BackendCheckoutResponse,
  fallbackTotalCedis?: number,
): CheckoutInitializeResponse {
  const authorizationUrl =
    data.authorizationUrl ??
    (typeof data.authorization_url === 'string' ? data.authorization_url : null);

  const paystackReference =
    data.paystackReference ??
    (typeof data.paystack_reference === 'string' ? data.paystack_reference : '');

  const orderId = data.orderId ?? (typeof data.order_id === 'string' ? data.order_id : '');

  const orderNumber =
    data.orderNumber ??
    (typeof data.order_number === 'string' ? data.order_number : undefined) ??
    orderId;

  if (!isValidPaymentUrl(authorizationUrl)) {
    throw new Error('Checkout did not return a payment URL. Please try again.');
  }

  if (!orderId) {
    throw new Error('Checkout did not return an order ID. Please try again.');
  }

  return {
    orderId,
    orderNumber,
    reference: paystackReference,
    authorizationUrl: authorizationUrl.trim(),
    amountInPesewas:
      data.amountInPesewas ??
      (data.totalAmount !== undefined
        ? cedisToPesewas(data.totalAmount)
        : fallbackTotalCedis !== undefined
          ? cedisToPesewas(fallbackTotalCedis)
          : undefined),
  };
}
