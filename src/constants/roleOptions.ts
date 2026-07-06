import type { RoleOption } from '@appTypes/onboarding';

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'customer',
    title: 'Customer',
    description: 'Homeowners & individual clients',
    icon: 'home',
  },
  {
    id: 'construction',
    title: 'Construction Agency',
    description: 'General contractors & firm managers',
    icon: 'engineering',
  },
  {
    id: 'delivery',
    title: 'Delivery Provider',
    description: 'Logistics & transport specialists',
    icon: 'local-shipping',
  },
];
