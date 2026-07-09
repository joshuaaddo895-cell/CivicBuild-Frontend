export type VerificationDocumentType =
  'BUSINESS_REGISTRATION' | 'GOVERNMENT_ID' | 'PROFESSIONAL_LICENSE';

export interface UploadedVerificationDocument {
  documentId: string;
  documentType: VerificationDocumentType;
}

export interface LocalUploadFile {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export interface VerificationDocumentUploadData {
  documentId: string;
  documentType: VerificationDocumentType;
  publicId: string;
  resourceType: string;
}

export interface VerificationDocumentUrlData {
  signedUrl: string;
  expiresAt: string;
}

export interface AgencyPortfolioUploadData {
  imageId: string;
  publicId: string;
  resourceType: string;
  deliveryUrl: string;
}

export interface AgencyPortfolioImage {
  imageId: string;
  deliveryUrl: string;
}

export const VERIFICATION_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const VERIFICATION_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const;

export const PORTFOLIO_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'] as const;

export const PORTFOLIO_MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
