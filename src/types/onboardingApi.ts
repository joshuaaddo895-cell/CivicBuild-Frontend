import type {
  AccountType,
  DeliveryProviderProfile,
  DeliveryProviderStatus,
} from '@appTypes/onboarding';

export type BackendVerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED';

export interface BackendOnboardingState {
  accountType: AccountType | null;
  onboardingComplete: boolean;
  verificationStatus: BackendVerificationStatus | null;
  managedAgencyId: string | null;
  deliveryProviderProfile: DeliveryProviderProfile | null;
  deliveryProviderStatus: DeliveryProviderStatus;
}

export interface PatchOnboardingInput {
  accountType?: AccountType;
}
