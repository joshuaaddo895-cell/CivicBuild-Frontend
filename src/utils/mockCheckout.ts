import type { CheckoutRequest, CheckoutInitializeResponse } from '@appTypes/order';
import { cedisToPesewas } from '@utils/paystackAmount';

export const MOCK_CHECKOUT_SCHEME = 'civicbuild://payment/callback';

export function shouldUseMockCheckout(): boolean {
  return process.env.EXPO_PUBLIC_USE_MOCK_CHECKOUT === 'true';
}

function generateOrderNumber(): string {
  const suffix = Math.floor(Math.random() * 900000 + 100000);
  return `CB-${Date.now().toString().slice(-6)}-${suffix}`;
}

export function mockInitializeCheckout(payload: CheckoutRequest): CheckoutInitializeResponse {
  const orderId = `ord_${Date.now()}`;
  const orderNumber = generateOrderNumber();
  const reference = `cb_${orderNumber.toLowerCase()}`;

  return {
    orderId,
    orderNumber,
    reference,
    authorizationUrl: `${MOCK_CHECKOUT_SCHEME}?reference=${reference}&orderId=${orderId}&orderNumber=${encodeURIComponent(orderNumber)}`,
    amountInPesewas: cedisToPesewas(payload.total),
  };
}

export function isMockCheckoutUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return url.startsWith(MOCK_CHECKOUT_SCHEME);
}

export function isPaymentCallbackUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  if (isMockCheckoutUrl(url)) {
    return true;
  }

  const lower = url.toLowerCase();
  return (
    lower.includes('/api/payments/paystack/callback') ||
    lower.includes('reference=') ||
    lower.includes('trxref=') ||
    lower.includes('/payment/callback')
  );
}

export function parsePaymentCallbackUrl(url: string | null | undefined): {
  reference?: string;
  orderId?: string;
  orderNumber?: string;
} {
  if (!url || typeof url !== 'string') {
    return {};
  }

  try {
    const parsed = new URL(url.replace('civicbuild://', 'https://civicbuild.app/'));
    return {
      reference:
        parsed.searchParams.get('reference') ?? parsed.searchParams.get('trxref') ?? undefined,
      orderId: parsed.searchParams.get('orderId') ?? undefined,
      orderNumber: parsed.searchParams.get('orderNumber') ?? undefined,
    };
  } catch {
    return {};
  }
}
