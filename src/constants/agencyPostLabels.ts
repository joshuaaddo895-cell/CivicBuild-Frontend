import type { AgencyPostType } from '@appTypes/agency';

export type AgencyPostCategory = 'service' | 'material';

export const AGENCY_POST_CATEGORY_LABELS: Record<AgencyPostCategory, string> = {
  service: 'Service',
  material: 'Material',
};

/** @deprecated Use AGENCY_POST_CATEGORY_LABELS */
export const AGENCY_POST_TYPE_LABELS: Record<AgencyPostType, string> = {
  service: AGENCY_POST_CATEGORY_LABELS.service,
  material: AGENCY_POST_CATEGORY_LABELS.material,
  general: 'Service',
};

export function normalizeAgencyPostCategory(type: AgencyPostType): AgencyPostCategory {
  return type === 'material' ? 'material' : 'service';
}

export function getAgencyPostCategoryLabel(type: AgencyPostType): string {
  return AGENCY_POST_CATEGORY_LABELS[normalizeAgencyPostCategory(type)];
}

export const AGENCY_POST_CATEGORIES: { id: AgencyPostCategory; label: string }[] = [
  { id: 'service', label: AGENCY_POST_CATEGORY_LABELS.service },
  { id: 'material', label: AGENCY_POST_CATEGORY_LABELS.material },
];
