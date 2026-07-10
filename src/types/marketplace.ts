/** Marketplace catalog entries — admin-curated listings, not tied to a Material Supplier role. */
export interface MarketplaceCategory {
  id: string;
  label: string;
  icon?: string;
}

export interface Supplier {
  id: string;
  name: string;
  logoUri: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  verified: boolean;
  categoryId: string;
}

export type MarketplaceListingKind = 'supplier' | 'agency';

export type MarketplaceListing = Supplier & {
  listingKind: MarketplaceListingKind;
  tagline?: string;
};

export interface Product {
  id: string;
  category: string;
  name: string;
  price: number;
  priceLabel: string;
  imageUri: string;
  imageAlt: string;
  // New fields requested for seed/mock data
  supplierName?: string;
  supplier_name?: string; // Support both snake_case and camelCase
  unit?: string;
  imageUrl?: string;
  image_url?: string; // Support both snake_case and camelCase
  inStock?: boolean;
  in_stock?: boolean; // Support both snake_case and camelCase
  supplierId?: string;
  agencyId?: string;
  stockQuantity?: number;
  highlight?: string;
  description?: string;
  brand?: string;
  spec?: string;
  size?: string;
  deliveryEstimate?: string;
}
