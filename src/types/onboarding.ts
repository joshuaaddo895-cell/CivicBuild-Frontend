import type { MaterialIcons } from '@expo/vector-icons';

export type AccountType = 'customer' | 'construction' | 'delivery';

export type OnboardingStep = 'complete' | 'verification' | 'delivery_setup';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type DeliveryProviderStatus =
  'none' | 'pending_company_confirmation' | 'approved' | 'rejected';

export interface RoleOption {
  id: AccountType;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export interface DeliveryProviderProfile {
  profileImageUri: string | null;
  fullName: string;
  constructionAgencyId: string | null;
  vehicleInfo?: string;
}
