export type AgencyPostType = 'service' | 'material' | 'general';

export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';

export type PersonnelApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface AgencyOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
}

export interface AgencyOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  agencyId: string;
  orderDate: string;
  status: OrderStatus;
  items: AgencyOrderItem[];
  deliveryAddress: string;
  totalAmount: number;
}

export interface AgencyPost {
  id: string;
  agencyId: string;
  type: AgencyPostType;
  title: string;
  description: string;
  imageUri?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPersonnelRecord {
  id: string;
  userId: string | null;
  profileImageUri: string | null;
  fullName: string;
  constructionAgencyId: string;
  vehicleInfo: string;
  approvalStatus: PersonnelApprovalStatus;
  submittedAt: string;
  handledAt?: string;
}

export interface AgencyProductInput {
  name: string;
  category: string;
  price: number;
  unit: string;
  stockQuantity: number;
  imageUri: string;
  description: string;
}

export interface AgencyProfileDetails {
  tagline: string;
  description: string;
  address: string;
  phone: string;
  hours: string;
  services: string[];
  portfolioImageUris: string[];
}
