import type { AgencyOrder, OrderStatus } from '@appTypes/agency';

export interface BackendAgencyOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
}

export interface BackendAgencyOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  agencyId: string;
  orderDate: string;
  status: OrderStatus;
  deliveryAddress: string;
  totalAmount: number;
  items: BackendAgencyOrderItem[];
}

export function mapBackendAgencyOrder(order: BackendAgencyOrder): AgencyOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    agencyId: order.agencyId,
    orderDate: order.orderDate,
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      unit: item.unit,
    })),
  };
}
