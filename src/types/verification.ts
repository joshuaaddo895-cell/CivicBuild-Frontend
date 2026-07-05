export interface VerificationDocument {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export interface VerificationFormValues {
  businessName: string;
  category: string;
  document: VerificationDocument | null;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function createEmptyVerificationForm(): VerificationFormValues {
  return {
    businessName: '',
    category: '',
    document: null,
  };
}

export function isVerificationFormValid(values: VerificationFormValues): boolean {
  return (
    values.businessName.trim().length > 0 && values.category.length > 0 && values.document !== null
  );
}

export function updateVerificationField<K extends keyof VerificationFormValues>(
  values: VerificationFormValues,
  key: K,
  value: VerificationFormValues[K],
): VerificationFormValues {
  return { ...values, [key]: value };
}
