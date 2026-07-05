import type { RoleOption } from '@appTypes/onboarding';

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'customer',
    title: 'Customer',
    description: 'Homeowners & individual clients',
    icon: 'home',
  },
  {
    id: 'supplier',
    title: 'Material Supplier',
    description: 'Providing cement, bricks & parts',
    icon: 'widgets',
  },
  {
    id: 'construction',
    title: 'Construction Agency',
    description: 'General contractors & firm managers',
    icon: 'engineering',
  },
  {
    id: 'planning',
    title: 'Planning Agency',
    description: 'Architects & structural engineers',
    icon: 'straighten',
  },
  {
    id: 'delivery',
    title: 'Delivery Provider',
    description: 'Logistics & transport specialists',
    icon: 'local-shipping',
  },
];
