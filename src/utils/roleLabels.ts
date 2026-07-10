import { getAgency } from '@api/agencies';
import { getProduct, getSupplier } from '@api/catalog';
import type { AccountType, VerificationStatus } from '@appTypes/onboarding';
import type { SavedItem, SavedItemDetail } from '@appTypes/saved';
import { formatPriceWithUnit } from '@utils/paystackAmount';

export function getAccountTypeLabel(accountType: AccountType | null): string {
  switch (accountType) {
    case 'customer':
      return 'Customer';
    case 'construction':
      return 'Construction Agency';
    case 'delivery':
      return 'Delivery Provider';
    default:
      return 'User';
  }
}

export function getVerificationStatusLabel(status: VerificationStatus | null): string {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'rejected':
      return 'Rejected';
    case 'pending':
      return 'Pending Verification';
    default:
      return '';
  }
}

export function getVerificationStatusColor(status: VerificationStatus | null): string {
  switch (status) {
    case 'verified':
      return '#006e1c';
    case 'rejected':
      return '#ba1a1a';
    case 'pending':
    default:
      return '#785900';
  }
}

const detailCache = new Map<string, SavedItemDetail | null>();

function cacheKey(item: SavedItem): string {
  return `${item.type}:${item.id}`;
}

export async function resolveSavedItemDetailAsync(
  item: SavedItem,
): Promise<SavedItemDetail | null> {
  const key = cacheKey(item);
  if (detailCache.has(key)) {
    return detailCache.get(key) ?? null;
  }

  if (item.type === 'product') {
    const result = await getProduct(item.id);
    if (!result.ok) {
      detailCache.set(key, null);
      return null;
    }
    const product = result.data;
    const detail: SavedItemDetail = {
      id: product.id,
      type: 'product',
      title: product.name,
      subtitle: product.category,
      imageUri: product.imageUri,
      priceLabel: formatPriceWithUnit(product.price, product.unit),
    };
    detailCache.set(key, detail);
    return detail;
  }

  if (item.type === 'supplier') {
    const result = await getSupplier(item.id);
    if (!result.ok) {
      detailCache.set(key, null);
      return null;
    }
    const supplier = result.data;
    const detail: SavedItemDetail = {
      id: supplier.id,
      type: 'supplier',
      title: supplier.name,
      subtitle: `${supplier.rating.toFixed(1)} rating · ${supplier.distanceKm.toFixed(1)} km away`,
      imageUri: supplier.logoUri,
    };
    detailCache.set(key, detail);
    return detail;
  }

  const result = await getAgency(item.id);
  if (!result.ok) {
    detailCache.set(key, null);
    return null;
  }
  const agency = result.data;
  const detail: SavedItemDetail = {
    id: agency.id,
    type: 'agency',
    title: agency.name,
    subtitle: 'Construction Agency',
    imageUri: agency.logoUrl ?? undefined,
  };
  detailCache.set(key, detail);
  return detail;
}

export function clearSavedDetailCache(): void {
  detailCache.clear();
}

/** @deprecated Use resolveSavedItemDetailAsync */
export function resolveSavedItemDetail(_item: SavedItem): SavedItemDetail | null {
  return null;
}
