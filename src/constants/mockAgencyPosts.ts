import type { AgencyPost } from '@appTypes/agency';

/** Seed posts for construction agencies — persisted edits go through agencyPostsStore. */
export const SEED_AGENCY_POSTS: AgencyPost[] = [
  {
    id: 'post-bs-1',
    agencyId: 'buildstrong-ltd',
    type: 'material',
    title: 'Fresh cement stock — Dangote 42.5N now available',
    description:
      'We just received a new shipment of Dangote 42.5N cement bags. Order through CivicBuild for same-week dispatch across Greater Accra.',
    imageUri:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-03-04T08:00:00.000Z',
    updatedAt: '2026-03-04T08:00:00.000Z',
  },
  {
    id: 'post-bs-2',
    agencyId: 'buildstrong-ltd',
    type: 'service',
    title: 'Foundation & structural steel packages',
    description:
      'BuildStrong now offers bundled foundation packages — blocks, cement, and Y12 rebar cut to your slab drawings. Message us for a site quote.',
    createdAt: '2026-02-20T11:30:00.000Z',
    updatedAt: '2026-02-20T11:30:00.000Z',
  },
  {
    id: 'post-apex-1',
    agencyId: 'apex-builders',
    type: 'general',
    title: 'Expanded delivery coverage to Tema & Kasoa',
    description:
      'Apex Builders Ghana has extended tipper and flatbed delivery routes to Tema Industrial Area and Kasoa. Bulk orders welcome.',
    createdAt: '2026-03-01T16:00:00.000Z',
    updatedAt: '2026-03-01T16:00:00.000Z',
  },
];

export const AGENCY_POST_TYPE_LABELS: Record<AgencyPost['type'], string> = {
  service: 'Service',
  material: 'Material',
  general: 'General Update',
};
