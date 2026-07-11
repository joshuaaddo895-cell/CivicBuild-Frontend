import {
  PORTFOLIO_ALLOWED_MIME_TYPES,
  PORTFOLIO_MAX_UPLOAD_BYTES,
  VERIFICATION_ALLOWED_MIME_TYPES,
  VERIFICATION_MAX_UPLOAD_BYTES,
  type LocalUploadFile,
} from '@appTypes/verificationDocuments';

function normalizeMimeType(mimeType?: string): string {
  return mimeType?.trim().toLowerCase() ?? '';
}

function inferMimeTypeFromName(name: string): string | null {
  const extension = name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return 'application/pdf';
  }

  if (extension === 'jpg' || extension === 'jpeg') {
    return 'image/jpeg';
  }

  if (extension === 'png') {
    return 'image/png';
  }

  return null;
}

export function resolveUploadMimeType(file: LocalUploadFile): string {
  const normalized = normalizeMimeType(file.mimeType);
  if (normalized) {
    return normalized;
  }

  return inferMimeTypeFromName(file.name) ?? 'application/octet-stream';
}

export function validateVerificationUpload(file: LocalUploadFile): string | null {
  const mimeType = resolveUploadMimeType(file);

  if (
    !VERIFICATION_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof VERIFICATION_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return 'Only PDF, JPG, and PNG files are accepted.';
  }

  if (file.size != null && file.size > VERIFICATION_MAX_UPLOAD_BYTES) {
    return 'File exceeds the 5MB limit. Please choose a smaller file.';
  }

  return null;
}

export function validatePortfolioUpload(file: LocalUploadFile): string | null {
  const mimeType = resolveUploadMimeType(file);

  if (
    !PORTFOLIO_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof PORTFOLIO_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return 'Only JPG and PNG images are accepted for portfolio uploads.';
  }

  if (file.size != null && file.size > PORTFOLIO_MAX_UPLOAD_BYTES) {
    return 'Image exceeds the 5MB limit. Please choose a smaller file.';
  }

  return null;
}

const LOCAL_UPLOAD_URI_PREFIXES = ['file://', 'content://', 'ph://', 'assets-library://', 'data:'];

export function isLocalUploadUri(uri: string | null | undefined): boolean {
  if (!uri) {
    return false;
  }

  if (!uri.includes('://')) {
    return true;
  }

  return LOCAL_UPLOAD_URI_PREFIXES.some((prefix) => uri.startsWith(prefix));
}

export function buildImageUploadFile(
  asset: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
  },
  prefix = 'image',
): LocalUploadFile {
  return {
    uri: asset.uri,
    name: asset.fileName ?? `${prefix}-${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
    size: asset.fileSize ?? undefined,
  };
}

export function buildMultipartFormData(file: LocalUploadFile): FormData {
  const formData = new FormData();
  const mimeType = resolveUploadMimeType(file);

  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: mimeType,
  } as unknown as Blob);

  return formData;
}

export function isPdfSignedUrl(url: string): boolean {
  const normalized = url.toLowerCase();
  return normalized.includes('.pdf') || normalized.includes('format=pdf');
}
