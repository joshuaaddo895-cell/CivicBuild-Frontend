import type { Supplier } from '@appTypes/marketplace';
import { MARKETPLACE_CATEGORIES } from '@constants/marketplaceData';

export interface SupplierProfileDetails {
  tagline: string;
  description: string;
  address: string;
  phone: string;
  hours: string;
  yearEstablished?: number;
}

const PROFILE_OVERRIDES: Record<string, SupplierProfileDetails> = {
  'west-africa-cement': {
    tagline: 'Premium cement & bulk materials since 2008',
    description:
      'West Africa Cement is one of Accra’s most trusted cement distributors, serving contractors, developers, and homeowners with GHACEM, Dangote, and specialty blends. Same-day dispatch available from our Tema warehouse.',
    address: 'Spintex Road, Accra · Tema warehouse',
    phone: '+233 30 281 4455',
    hours: 'Mon–Sat · 6:30 AM – 7:00 PM',
    yearEstablished: 2008,
  },
  'buildstrong-ltd': {
    tagline: 'Building materials for projects of every scale',
    description:
      'BuildStrong Ltd stocks cement, blocks, steel, and finishing materials for residential and commercial builds across Greater Accra. On-site quantity checks and flexible pickup or delivery.',
    address: 'North Industrial Area, Accra',
    phone: '+233 24 456 7890',
    hours: 'Mon–Fri · 7:00 AM – 6:00 PM · Sat · 8:00 AM – 2:00 PM',
    yearEstablished: 2012,
  },
  'accra-cement-depot': {
    tagline: 'Your neighbourhood cement depot',
    description:
      'Accra Cement Depot keeps popular 32.5R and 42.5R grades in stock for walk-in and app orders. Ideal for small renovations and mid-size site pours within the city.',
    address: 'Kaneshie Market Road, Accra',
    phone: '+233 30 222 1188',
    hours: 'Daily · 6:00 AM – 8:00 PM',
    yearEstablished: 2015,
  },
  'quarry-direct-gh': {
    tagline: 'Sand, gravel & aggregates direct from quarry',
    description:
      'Quarry Direct Ghana supplies washed sand, quarry dust, and graded aggregates with tipper delivery across Accra and Tema. Bulk pricing available for foundation and roadworks.',
    address: 'Shai Hills Quarry Access Road',
    phone: '+233 20 911 3344',
    hours: 'Mon–Sat · 5:30 AM – 6:30 PM',
    yearEstablished: 2010,
  },
  'tema-steel-merchants': {
    tagline: 'Structural steel & rebar specialists',
    description:
      'Tema Steel Merchants cut and bundle Y8–Y25 rebar to spec. We support slab, column, and retaining wall projects with mill certificates on request.',
    address: 'Harbour Area, Tema',
    phone: '+233 30 330 7722',
    hours: 'Mon–Sat · 7:00 AM – 5:30 PM',
    yearEstablished: 2006,
  },
};

function getCategoryLabel(categoryId: string): string {
  return (
    MARKETPLACE_CATEGORIES.find((category) => category.id === categoryId)?.label ?? 'Materials'
  );
}

function buildDefaultProfile(supplier: Supplier): SupplierProfileDetails {
  const categoryLabel = getCategoryLabel(supplier.categoryId);

  return {
    tagline: `Trusted ${categoryLabel.toLowerCase()} supplier near you`,
    description: `${supplier.name} provides quality ${categoryLabel.toLowerCase()} for construction projects across Greater Accra. Order through CivicBuild for transparent pricing, verified listings, and coordinated pickup or delivery.`,
    address: `Greater Accra · ${supplier.distanceKm.toFixed(1)} km from your location`,
    phone: '+233 30 000 0000',
    hours: 'Mon–Sat · 7:00 AM – 6:00 PM',
  };
}

export function getSupplierProfile(supplier: Supplier): SupplierProfileDetails {
  return PROFILE_OVERRIDES[supplier.id] ?? buildDefaultProfile(supplier);
}

export function getSupplierCategoryLabel(supplier: Supplier): string {
  return getCategoryLabel(supplier.categoryId);
}
