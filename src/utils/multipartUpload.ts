/** Let axios/React Native set the multipart boundary — do not set Content-Type manually. */
export function getMultipartUploadConfig() {
  return {
    headers: {
      Accept: 'application/json',
    },
  };
}

export function normalizeProductUnit(unit: string): string {
  const trimmed = unit.trim();
  if (/^per\s+/i.test(trimmed)) {
    return trimmed;
  }

  return `per ${trimmed}`;
}
