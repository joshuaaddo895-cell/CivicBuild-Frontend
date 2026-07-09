import type {
  UploadedVerificationDocument,
  VerificationDocumentType,
} from '@appTypes/verificationDocuments';

export type VerificationDocumentsState = Partial<
  Record<VerificationDocumentType, UploadedVerificationDocument>
>;

export interface VerificationFormValues {
  businessName: string;
  category: string;
  documents: VerificationDocumentsState;
}

export function createEmptyVerificationForm(): VerificationFormValues {
  return {
    businessName: '',
    category: '',
    documents: {},
  };
}

export function getRequiredVerificationDocumentTypes(
  accountType: 'construction' | 'delivery',
): VerificationDocumentType[] {
  if (accountType === 'construction') {
    return ['BUSINESS_REGISTRATION', 'PROFESSIONAL_LICENSE'];
  }

  return ['GOVERNMENT_ID', 'PROFESSIONAL_LICENSE'];
}

export function areRequiredVerificationDocumentsUploaded(
  documents: VerificationDocumentsState,
  requiredTypes: VerificationDocumentType[],
): boolean {
  return requiredTypes.every((documentType) => Boolean(documents[documentType]?.documentId));
}

export function isVerificationFormValid(
  values: VerificationFormValues,
  requiredDocumentTypes: VerificationDocumentType[],
): boolean {
  return (
    values.businessName.trim().length > 0 &&
    values.category.length > 0 &&
    areRequiredVerificationDocumentsUploaded(values.documents, requiredDocumentTypes)
  );
}

export function updateVerificationField<K extends keyof VerificationFormValues>(
  values: VerificationFormValues,
  key: K,
  value: VerificationFormValues[K],
): VerificationFormValues {
  return { ...values, [key]: value };
}

export function setVerificationDocument(
  documents: VerificationDocumentsState,
  uploaded: UploadedVerificationDocument,
): VerificationDocumentsState {
  return {
    ...documents,
    [uploaded.documentType]: uploaded,
  };
}
