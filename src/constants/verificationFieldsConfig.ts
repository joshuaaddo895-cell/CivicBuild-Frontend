import type { AccountType } from '@appTypes/onboarding';
import type { VerificationDocumentType } from '@appTypes/verificationDocuments';

export type VerificationFieldId = 'businessName' | 'category';

export type VerificationFieldType = 'text' | 'select';

export interface VerificationSelectOption {
  label: string;
  value: string;
}

export interface VerificationFieldConfig {
  id: VerificationFieldId;
  type: VerificationFieldType;
  label: string;
  placeholder?: string;
  options?: VerificationSelectOption[];
}

export interface VerificationUploadFieldConfig {
  documentType: VerificationDocumentType;
  sectionLabel: string;
  title: string;
  subtitle: string;
  example: string;
}

export interface VerificationRoleConfig {
  fields: VerificationFieldConfig[];
  uploads: VerificationUploadFieldConfig[];
}

export const CONSTRUCTION_VERIFICATION_CONFIG: VerificationRoleConfig = {
  fields: [
    {
      id: 'businessName',
      type: 'text',
      label: 'Agency Name',
      placeholder: 'Enter legal agency name',
    },
    {
      id: 'category',
      type: 'select',
      label: 'Service Category',
      placeholder: 'Select a category',
      options: [
        { label: 'General Contracting', value: 'general-contracting' },
        { label: 'Renovation', value: 'renovation' },
        { label: 'Commercial Builds', value: 'commercial' },
        { label: 'Residential Builds', value: 'residential' },
        { label: 'Landscaping', value: 'landscaping' },
      ],
    },
  ],
  uploads: [
    {
      documentType: 'BUSINESS_REGISTRATION',
      sectionLabel: 'Business Registration',
      title: 'Upload business registration',
      subtitle: 'PDF, JPG, or PNG (max 5MB)',
      example: 'Example: Certificate of incorporation, business registration certificate',
    },
    {
      documentType: 'PROFESSIONAL_LICENSE',
      sectionLabel: 'Professional / Contractor License',
      title: 'Upload professional license',
      subtitle: 'PDF, JPG, or PNG (max 5MB)',
      example: "Example: Contractor's license, professional certification",
    },
  ],
};

export const DELIVERY_VERIFICATION_UPLOADS: VerificationUploadFieldConfig[] = [
  {
    documentType: 'GOVERNMENT_ID',
    sectionLabel: 'Government ID',
    title: 'Upload government-issued ID',
    subtitle: 'PDF, JPG, or PNG (max 5MB)',
    example: 'Example: National ID, passport, voter ID',
  },
  {
    documentType: 'PROFESSIONAL_LICENSE',
    sectionLabel: "Driver's / Professional License",
    title: 'Upload license document',
    subtitle: 'PDF, JPG, or PNG (max 5MB)',
    example: "Example: Driver's license, professional driving permit",
  },
];

export function getVerificationConfig(
  accountType: AccountType | null,
): VerificationRoleConfig | null {
  if (accountType !== 'construction') {
    return null;
  }

  return CONSTRUCTION_VERIFICATION_CONFIG;
}
