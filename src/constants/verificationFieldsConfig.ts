import type { AccountType } from '@appTypes/onboarding';

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

export interface VerificationUploadConfig {
  sectionLabel: string;
  title: string;
  subtitle: string;
  example: string;
}

export interface VerificationRoleConfig {
  fields: VerificationFieldConfig[];
  upload: VerificationUploadConfig;
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
  upload: {
    sectionLabel: 'Verification Documents',
    title: 'Click or tap to upload',
    subtitle: 'PDF, JPG, or PNG (Max. 10MB)',
    example: 'Example: Contractor License, Portfolio PDF',
  },
};

export function getVerificationConfig(
  accountType: AccountType | null,
): VerificationRoleConfig | null {
  if (accountType !== 'construction') {
    return null;
  }

  return CONSTRUCTION_VERIFICATION_CONFIG;
}
