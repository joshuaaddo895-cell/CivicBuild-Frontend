import type { BackendAgency } from '@api/agencies';
import type { MarketplaceListing, Supplier } from '@appTypes/marketplace';

export function mapAgencyToListing(agency: BackendAgency): MarketplaceListing {
  return {
    id: agency.id,
    name: agency.name,
    logoUri: agency.logoUrl ?? '',
    rating: 0,
    reviewCount: 0,
    distanceKm: 0,
    verified: agency.verified,
    categoryId: agency.category,
    listingKind: 'agency',
    tagline: agency.tagline ?? 'Construction agency',
  };
}

export function mapSupplierToListing(supplier: Supplier): MarketplaceListing {
  return {
    ...supplier,
    logoUri: supplier.logoUri ?? '',
    listingKind: 'supplier',
  };
}

export function mergeMarketplaceListings(
  suppliers: Supplier[],
  agencies: BackendAgency[],
): MarketplaceListing[] {
  const agencyListings = agencies.map(mapAgencyToListing);
  const supplierListings = suppliers.map(mapSupplierToListing);

  return [...agencyListings, ...supplierListings];
}

export function isAgencyListing(listing: MarketplaceListing): boolean {
  return listing.listingKind === 'agency';
}
