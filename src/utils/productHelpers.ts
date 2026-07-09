import type { Product, Supplier } from '@appTypes/marketplace';
import { getPopularProducts, TRUSTED_SUPPLIERS } from '@constants/marketplaceData';
import { MESSAGE_THREADS } from '@constants/messagesData';

export function findProductById(productId: string): Product | undefined {
  return getPopularProducts().find((product) => product.id === productId);
}

export function findSupplierById(supplierId: string): Supplier | undefined {
  return TRUSTED_SUPPLIERS.find((supplier) => supplier.id === supplierId);
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
  if (product.supplierId) {
    return TRUSTED_SUPPLIERS.find((supplier) => supplier.id === product.supplierId);
  }

  const supplierName = product.supplierName ?? product.supplier_name;
  if (!supplierName) {
    return undefined;
  }

  const normalized = supplierName.trim().toLowerCase();
  return TRUSTED_SUPPLIERS.find(
    (supplier) =>
      supplier.name.toLowerCase() === normalized ||
      normalized.includes(supplier.name.toLowerCase()) ||
      supplier.name.toLowerCase().includes(normalized),
  );
}

export function findMessageThreadIdForSupplier(supplierName: string): string | undefined {
  const normalized = supplierName.trim().toLowerCase();
  const thread = MESSAGE_THREADS.find(
    (entry) => entry.participantName.toLowerCase() === normalized,
  );
  return thread?.id;
}

export function buildSupplierThreadId(supplierId: string): string {
  return `thread-${supplierId}`;
}

export function resolveMessageNavigationForSupplier(supplier: Supplier): {
  threadId: string;
  participantName: string;
  participantLogoUri: string;
} {
  return {
    threadId: findMessageThreadIdForSupplier(supplier.name) ?? buildSupplierThreadId(supplier.id),
    participantName: supplier.name,
    participantLogoUri: supplier.logoUri,
  };
}
