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
}

export interface Product {
  id: string;
  category: string;
  name: string;
  price: number;
  priceLabel: string;
  imageUri: string;
  imageAlt: string;
}
