import type { BackendAgency } from '@api/agencies';
import type { ConstructionAgency } from '@appTypes/deliveryProvider';
import type { Supplier } from '@appTypes/marketplace';

export function mapBackendAgencyToConstructionAgency(agency: BackendAgency): ConstructionAgency {
  return {
    id: agency.id,
    name: agency.name,
    logoUri: agency.logoUrl ?? '',
    verified: agency.verified,
  };
}

export function mapBackendAgencyToSupplierCard(agency: BackendAgency): Supplier {
  return {
    id: agency.id,
    name: agency.name,
    logoUri: agency.logoUrl ?? '',
    rating: 0,
    reviewCount: 0,
    distanceKm: 0,
    verified: agency.verified,
    categoryId: agency.category,
  };
}
