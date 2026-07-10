export type DeliveryApprovalStatus = 'pending' | 'approved' | 'rejected';
export type DeliveryJobStatus = 'assigned' | 'in_transit' | 'delivered';

export interface DeliveryProviderSetupInput {
  fullName: string;
  constructionAgencyId?: string | null;
  vehicleInfo?: string;
  profileImageUrl?: string;
}

export interface BackendDeliveryProvider {
  id: string;
  userId: string;
  fullName: string;
  constructionAgencyId?: string | null;
  vehicleInfo?: string;
  profileImageUrl?: string | null;
  approvalStatus: DeliveryApprovalStatus;
  submittedAt: string;
  handledAt?: string | null;
}

export interface BackendDeliveryJob {
  id: string;
  orderId: string;
  orderNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: DeliveryJobStatus;
  assignedAt: string;
}
