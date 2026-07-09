import type { AgencyOrder } from '@appTypes/agency';

/** Mock agency orders — replace with backend Order API scoped by agency_id. */
export const MOCK_AGENCY_ORDERS: AgencyOrder[] = [
  {
    id: 'order-001',
    orderNumber: 'CB-2026-0042',
    customerId: 'customer-kwame',
    customerName: 'Kwame Mensah',
    customerEmail: 'kwame.mensah@example.com',
    customerPhone: '+233 24 123 4567',
    agencyId: 'buildstrong-ltd',
    orderDate: '2026-03-05T10:30:00.000Z',
    status: 'processing',
    deliveryAddress: '14 Ring Road Central, Osu, Accra',
    totalAmount: 450,
    items: [
      {
        productId: 'cement-2',
        productName: 'Dangote Cement 42.5N (50kg)',
        quantity: 3,
        unitPrice: 88,
        unit: 'bag',
      },
      {
        productId: 'blocks-1',
        productName: '6-inch Solid Concrete Block',
        quantity: 50,
        unitPrice: 3.6,
        unit: 'block',
      },
    ],
  },
  {
    id: 'order-002',
    orderNumber: 'CB-2026-0038',
    customerId: 'customer-ama',
    customerName: 'Ama Osei',
    customerEmail: 'ama.osei@example.com',
    customerPhone: '+233 20 987 6543',
    agencyId: 'buildstrong-ltd',
    orderDate: '2026-03-02T14:15:00.000Z',
    status: 'delivered',
    deliveryAddress: '22 Spintex Road, Tema Community 25',
    totalAmount: 1240,
    items: [
      {
        productId: 'steel-1',
        productName: 'Y12 High Tensile Rebar (6m)',
        quantity: 20,
        unitPrice: 42,
        unit: 'piece',
      },
      {
        productId: 'cement-2',
        productName: 'Dangote Cement 42.5N (50kg)',
        quantity: 10,
        unitPrice: 88,
        unit: 'bag',
      },
    ],
  },
  {
    id: 'order-003',
    orderNumber: 'CB-2026-0031',
    customerId: 'customer-kofi',
    customerName: 'Kofi Asante',
    customerEmail: 'kofi.asante@example.com',
    customerPhone: '+233 55 321 0987',
    agencyId: 'buildstrong-ltd',
    orderDate: '2026-02-28T09:00:00.000Z',
    status: 'pending',
    deliveryAddress: '5 Liberation Road, Airport Residential, Accra',
    totalAmount: 285,
    items: [
      {
        productId: 'paint-1',
        productName: 'Dulux WeatherShield Exterior Emulsion (20L)',
        quantity: 1,
        unitPrice: 285,
        unit: 'gallon',
      },
    ],
  },
];

export function getOrdersByAgencyId(agencyId: string): AgencyOrder[] {
  return MOCK_AGENCY_ORDERS.filter((order) => order.agencyId === agencyId).sort(
    (left, right) => new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime(),
  );
}

export function getOrderById(orderId: string): AgencyOrder | undefined {
  return MOCK_AGENCY_ORDERS.find((order) => order.id === orderId);
}

export function formatOrderItemSummary(itemCount: number, totalAmount: number): string {
  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;
  return `${itemLabel} · GH₵ ${totalAmount.toLocaleString('en-GH')}`;
}

export function getOrderStatusLabel(status: AgencyOrder['status']): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'processing':
      return 'Processing';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}
