export interface ConstructionAgency {
  id: string;
  name: string;
  logoUri: string;
  verified: boolean;
}

export interface DeliveryProviderSetupFormData {
  profileImageUri: string | null;
  fullName: string;
  constructionAgencyId: string | null;
}
