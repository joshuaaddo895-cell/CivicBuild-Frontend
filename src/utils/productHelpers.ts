import type { Product, Supplier } from '@appTypes/marketplace';
import { POPULAR_PRODUCTS, TRUSTED_SUPPLIERS } from '@constants/marketplaceData';
import { MESSAGE_THREADS } from '@constants/messagesData';

export function findProductById(productId: string): Product | undefined {
  return POPULAR_PRODUCTS.find((product) => product.id === productId);
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
