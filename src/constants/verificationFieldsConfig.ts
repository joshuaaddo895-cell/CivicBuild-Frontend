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

export type VerifiableAccountType = Exclude<AccountType, 'customer'>;

export const VERIFICATION_FIELDS_CONFIG: Record<VerifiableAccountType, VerificationRoleConfig> = {
  supplier: {
    fields: [
      {
        id: 'businessName',
        type: 'text',
        label: 'Business Name',
        placeholder: 'Enter legal business name',
      },
      {
        id: 'category',
        type: 'select',
        label: 'Product Category',
        placeholder: 'Select a category',
        options: [
          { label: 'Cement', value: 'cement' },
          { label: 'Blocks / Bricks', value: 'blocks-bricks' },
          { label: 'Roofing', value: 'roofing' },
          { label: 'Plumbing', value: 'plumbing' },
          { label: 'Electrical', value: 'electrical' },
          { label: 'Tiles', value: 'tiles' },
          { label: 'Paint', value: 'paint' },
        ],
      },
    ],
    upload: {
      sectionLabel: 'Verification Documents',
      title: 'Click or tap to upload',
      subtitle: 'PDF, JPG, or PNG (Max. 10MB)',
      example: 'Example: Business License, Insurance Certs',
    },
  },
  construction: {
    fields: [
      {
        id: 'businessName',
        type: 'text',
        label: 'Business Name',
        placeholder: 'Enter legal business name',
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
  },
  planning: {
    fields: [
      {
        id: 'businessName',
        type: 'text',
        label: 'Business Name',
        placeholder: 'Enter legal business name',
      },
      {
        id: 'category',
        type: 'select',
        label: 'Design Specialty',
        placeholder: 'Select a specialty',
        options: [
          { label: 'Architecture', value: 'architecture' },
          { label: 'Structural Engineering', value: 'structural-engineering' },
          { label: 'Urban Planning', value: 'urban-planning' },
          { label: 'Interior Design', value: 'interior-design' },
        ],
      },
    ],
    upload: {
      sectionLabel: 'Verification Documents',
      title: 'Click or tap to upload',
      subtitle: 'PDF, JPG, or PNG (Max. 10MB)',
      example: 'Example: Professional License, Accreditation',
    },
  },
  delivery: {
    fields: [
      {
        id: 'businessName',
        type: 'text',
        label: 'Business Name',
        placeholder: 'Enter legal business name',
      },
      {
        id: 'category',
        type: 'select',
        label: 'Vehicle Type',
        placeholder: 'Select vehicle type',
        options: [
          { label: 'Truck', value: 'truck' },
          { label: 'Van', value: 'van' },
          { label: 'Motorcycle', value: 'motorcycle' },
          { label: 'Heavy Haulage', value: 'heavy-haulage' },
        ],
      },
    ],
    upload: {
      sectionLabel: 'Verification Documents',
      title: 'Click or tap to upload',
      subtitle: 'PDF, JPG, or PNG (Max. 10MB)',
      example: "Example: Driver's License, Vehicle Registration",
    },
  },
};

export function getVerificationConfig(
  accountType: AccountType | null,
): VerificationRoleConfig | null {
  if (!accountType || accountType === 'customer') {
    return null;
  }
  return VERIFICATION_FIELDS_CONFIG[accountType];
}
