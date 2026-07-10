import type { Product, Supplier } from '@appTypes/marketplace';
import { getPopularProducts } from '@store/productStore';

export function findProductById(productId: string): Product | undefined {
  return getPopularProducts().find((product) => product.id === productId);
}

export function findProductsBySupplier(supplier: Supplier, limit = 8): Product[] {
  const products = getPopularProducts();
  const byLink = products.filter((product) => {
    if (product.supplierId === supplier.id) {
      return true;
    }

    const supplierName = product.supplierName ?? product.supplier_name;
    if (!supplierName) {
      return false;
    }

    const normalized = supplierName.trim().toLowerCase();
    const supplierNormalized = supplier.name.trim().toLowerCase();

    return (
      normalized === supplierNormalized ||
      normalized.includes(supplierNormalized) ||
      supplierNormalized.includes(normalized)
    );
  });

  if (byLink.length > 0) {
    return byLink.slice(0, limit);
  }

  return products
    .filter((product) => product.category.toLowerCase() === supplier.categoryId.toLowerCase())
    .slice(0, limit);
}

export function findProductsByAgencyId(agencyId: string, limit = 8): Product[] {
  return getPopularProducts()
    .filter((product) => product.agencyId === agencyId)
    .slice(0, limit);
}

export function resolveSupplierForProduct(product: Product): Supplier | undefined {
  if (!product.supplierId && !product.supplierName && !product.supplier_name) {
    return undefined;
  }

  const supplierName = product.supplierName ?? product.supplier_name ?? 'Supplier';
  return {
    id: product.supplierId ?? product.id,
    name: supplierName,
    logoUri: product.imageUri,
    rating: 0,
    reviewCount: 0,
    distanceKm: 0,
    verified: false,
    categoryId: product.category,
  };
}

export function resolveMessageNavigationForSupplier(supplier: Supplier): {
  participantName: string;
  participantLogoUri: string;
} {
  return {
    participantName: supplier.name,
    participantLogoUri: supplier.logoUri,
  };
}
