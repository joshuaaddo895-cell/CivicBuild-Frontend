import type { AgencyProfileDetails } from '@appTypes/agency';
import type { ConstructionAgency } from '@appTypes/deliveryProvider';
import { VERIFIED_CONSTRUCTION_AGENCIES } from '@constants/constructionAgencies';

const PROFILE_DETAILS: Record<string, AgencyProfileDetails> = {
  'buildstrong-ltd': {
    tagline: 'Building materials & project support since 2012',
    description:
      'BuildStrong Ltd is a verified construction agency supplying cement, blocks, steel, and finishing materials across Greater Accra. We coordinate on-site delivery and quantity checks for residential and commercial builds.',
    address: 'North Industrial Area, Accra',
    phone: '+233 24 456 7890',
    hours: 'Mon–Fri · 7:00 AM – 6:00 PM · Sat · 8:00 AM – 2:00 PM',
    services: [
      'Material procurement & supply',
      'On-site quantity verification',
      'Structural steel bundling',
      'Pickup or coordinated delivery',
    ],
    portfolioImageUris: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565195164432-7b915e3fac8b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  'apex-builders': {
    tagline: 'Commercial builds & bulk material logistics',
    description:
      'Apex Builders Ghana partners with developers on mid-rise and commercial projects. Our marketplace listings cover aggregates, roofing, and finishing materials with fleet delivery across Accra and Tema.',
    address: 'East Legon, Accra',
    phone: '+233 30 255 8899',
    hours: 'Mon–Sat · 7:30 AM – 5:30 PM',
    services: [
      'Commercial project procurement',
      'Bulk aggregate delivery',
      'Roofing material supply',
      'Developer account management',
    ],
    portfolioImageUris: [
      'https://images.unsplash.com/photo-1632778149955-9c7f7370e4e8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615873968403-89e068baa2be?auto=format&fit=crop&w=800&q=80',
    ],
  },
};

function buildDefaultProfile(agency: ConstructionAgency): AgencyProfileDetails {
  return {
    tagline: 'Verified construction agency on CivicBuild',
    description: `${agency.name} provides construction services and material supply through the CivicBuild marketplace.`,
    address: 'Greater Accra, Ghana',
    phone: '+233 30 000 0000',
    hours: 'Mon–Sat · 7:00 AM – 6:00 PM',
    services: ['Material supply', 'Project coordination', 'Delivery logistics'],
    portfolioImageUris: [agency.logoUri],
  };
}

export function getAgencyProfile(agencyId: string): AgencyProfileDetails | undefined {
  const agency = VERIFIED_CONSTRUCTION_AGENCIES.find((entry) => entry.id === agencyId);
  if (!agency) {
    return undefined;
  }

  return PROFILE_DETAILS[agencyId] ?? buildDefaultProfile(agency);
}

export function isConstructionAgencyId(id: string): boolean {
  return VERIFIED_CONSTRUCTION_AGENCIES.some((agency) => agency.id === id);
}

export const PRODUCT_FORM_CATEGORIES = [
  'cement',
  'blocks',
  'gravel',
  'steel',
  'roofing',
  'tiles',
  'paint',
  'plumbing',
  'electrical',
] as const;

export const PRODUCT_FORM_UNITS = [
  'bag',
  'block',
  'ton',
  'sheet',
  'm²',
  'gallon',
  'piece',
] as const;
