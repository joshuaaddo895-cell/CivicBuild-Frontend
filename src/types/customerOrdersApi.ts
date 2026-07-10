import type { OrderStatus } from '@appTypes/order';

export interface BackendCustomerOrderItem {
  productId?: string;
  productName: string;
  supplierName?: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
}

export interface BackendCustomerOrder {
  orderId?: string;
  id?: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  total?: number;
  deliveryAddress?: string;
  orderDate?: string;
  createdAt?: string;
  items?: BackendCustomerOrderItem[];
  paystackReference?: string;
}

export interface CustomerOrder {
  orderId: string;
  orderNumber: string;
  status: OrderStatus | string;
  totalAmount: number;
  deliveryAddress: string;
  orderDate: string;
  items: BackendCustomerOrderItem[];
  paystackReference?: string;
}

function normalizeOrderStatus(status?: string): OrderStatus | string {
  if (!status) {
    return 'PENDING';
  }

  const upper = status.toUpperCase();
  if (upper === 'PAID' || upper === 'PENDING' || upper === 'FAILED' || upper === 'CANCELLED') {
    return upper as OrderStatus;
  }

  return status;
}

export function mapBackendCustomerOrder(order: BackendCustomerOrder): CustomerOrder {
  const orderId = order.orderId ?? order.id ?? '';

  return {
    orderId,
    orderNumber: order.orderNumber ?? orderId,
    status: normalizeOrderStatus(order.status),
    totalAmount: Number(order.totalAmount ?? order.total ?? 0),
    deliveryAddress: order.deliveryAddress ?? '',
    orderDate: order.orderDate ?? order.createdAt ?? new Date().toISOString(),
    items: (order.items ?? []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      supplierName: item.supplierName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      unit: item.unit,
    })),
    paystackReference: order.paystackReference,
  };
}

export function getCustomerOrderStatusLabel(status: OrderStatus | string): string {
  switch (String(status).toUpperCase()) {
    case 'PAID':
      return 'Paid';
    case 'PENDING':
      return 'Pending payment';
    case 'PROCESSING':
      return 'Processing';
    case 'FAILED':
      return 'Failed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'DELIVERED':
      return 'Delivered';
    default:
      return String(status);
  }
}
