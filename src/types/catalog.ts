export interface BackendCategory {
  id: string;
  name: string;
}

export interface BackendSupplier {
  id: string;
  name: string;
  logoUrl: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  verified: boolean;
  categoryId: string;
}

export interface BackendProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  imageUrl: string;
  description?: string;
  supplierId?: string;
  agencyId?: string;
  stockQuantity?: number;
  inStock: boolean;
  brand?: string;
  spec?: string;
  deliveryEstimate?: string;
}

export interface PaginatedItems<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export interface CatalogQuery {
  q?: string;
  category?: string;
  supplierId?: string;
  agencyId?: string;
  page?: number;
  limit?: number;
}
