import type { AgencyPostType } from '@appTypes/agency';

export type AgencyPostCategory = 'service';

export const AGENCY_POST_CATEGORY_LABELS: Record<AgencyPostCategory, string> = {
  service: 'Service',
};

/** @deprecated Use AGENCY_POST_CATEGORY_LABELS */
export const AGENCY_POST_TYPE_LABELS: Record<AgencyPostType, string> = {
  service: AGENCY_POST_CATEGORY_LABELS.service,
  material: 'Material', // Kept for legacy mapping
  general: 'Service',
};

export function normalizeAgencyPostCategory(_type: AgencyPostType): AgencyPostCategory {
  return 'service'; // All new posts are services
}

export function getAgencyPostCategoryLabel(type: AgencyPostType): string {
  return type === 'material' ? 'Material' : AGENCY_POST_CATEGORY_LABELS.service;
}

export const AGENCY_POST_CATEGORIES: { id: AgencyPostCategory; label: string }[] = [
  { id: 'service', label: AGENCY_POST_CATEGORY_LABELS.service },
];
