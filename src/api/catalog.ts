import type { ApiResponse } from '@appTypes/api';
import type {
  BackendCategory,
  BackendProduct,
  BackendSupplier,
  CatalogQuery,
  PaginatedItems,
} from '@appTypes/catalog';
import type { Product, Supplier } from '@appTypes/marketplace';
import { formatGhCedisPrice } from '@utils/paystackAmount';
import { enrichProduct } from '@utils/productEnrichment';

import { toApiResult, type ApiResult } from './apiResult';
import { unwrapApiResponse } from './authTypes';
import apiClient from './client';

function unwrapPaginated<T>(response: ApiResponse<PaginatedItems<T>>): PaginatedItems<T> {
  return unwrapApiResponse(response);
}

export function mapBackendProduct(product: BackendProduct): Product {
  return enrichProduct({
    id: product.id,
    category: product.category,
    name: product.name,
    price: product.price,
    priceLabel: formatGhCedisPrice(product.price),
    imageUri: product.imageUrl,
    imageAlt: product.name,
    imageUrl: product.imageUrl,
    image_url: product.imageUrl,
    unit: product.unit,
    description: product.description,
    supplierId: product.supplierId,
    agencyId: product.agencyId,
    stockQuantity: product.stockQuantity,
    inStock: product.inStock,
    in_stock: product.inStock,
    brand: product.brand,
    spec: product.spec,
    deliveryEstimate: product.deliveryEstimate,
  });
}

export function mapBackendSupplier(supplier: BackendSupplier): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    logoUri: supplier.logoUrl,
    rating: supplier.rating,
    reviewCount: supplier.reviewCount,
    distanceKm: supplier.distanceKm,
    verified: supplier.verified,
    categoryId: supplier.categoryId,
  };
}

export async function getCategories(): Promise<ApiResult<BackendCategory[]>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendCategory[]>>('/api/categories')
      .then((response) => unwrapApiResponse(response.data)),
  );
}

export async function getSuppliers(
  query: CatalogQuery = {},
): Promise<ApiResult<{ items: Supplier[]; hasNextPage: boolean; total: number }>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<PaginatedItems<BackendSupplier>>>('/api/suppliers', { params: query })
      .then((response) => {
        const page = unwrapPaginated(response.data);
        return {
          items: page.items.map(mapBackendSupplier),
          hasNextPage: page.hasNextPage,
          total: page.total,
        };
      }),
  );
}

export async function getSupplier(supplierId: string): Promise<ApiResult<Supplier>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendSupplier>>(`/api/suppliers/${supplierId}`)
      .then((response) => mapBackendSupplier(unwrapApiResponse(response.data))),
  );
}

export async function getProducts(
  query: CatalogQuery = {},
): Promise<ApiResult<{ items: Product[]; hasNextPage: boolean; total: number }>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<PaginatedItems<BackendProduct>>>('/api/products', { params: query })
      .then((response) => {
        const page = unwrapPaginated(response.data);
        return {
          items: page.items.map(mapBackendProduct),
          hasNextPage: page.hasNextPage,
          total: page.total,
        };
      }),
  );
}

export async function getProduct(productId: string): Promise<ApiResult<Product>> {
  return toApiResult(
    apiClient
      .get<ApiResponse<BackendProduct>>(`/api/products/${productId}`)
      .then((response) => mapBackendProduct(unwrapApiResponse(response.data))),
  );
}
