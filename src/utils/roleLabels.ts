import type { AccountType, VerificationStatus } from '@appTypes/onboarding';
import type { SavedItem, SavedItemDetail } from '@appTypes/saved';
import { VERIFIED_CONSTRUCTION_AGENCIES } from '@constants/constructionAgencies';
import { getPopularProducts, TRUSTED_SUPPLIERS } from '@constants/marketplaceData';
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
      return 'Pending';
    default:
      return 'Pending';
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

export function resolveSavedItemDetail(item: SavedItem): SavedItemDetail | null {
  if (item.type === 'product') {
    const product = getPopularProducts().find((entry) => entry.id === item.id);
    if (!product) {
      return null;
    }

    return {
      id: product.id,
      type: 'product',
      title: product.name,
      subtitle: product.category,
      imageUri: product.imageUri,
      priceLabel: formatPriceWithUnit(product.price, product.unit),
    };
  }

  if (item.type === 'supplier') {
    const supplier = TRUSTED_SUPPLIERS.find((entry) => entry.id === item.id);
    if (!supplier) {
      return null;
    }

    return {
      id: supplier.id,
      type: 'supplier',
      title: supplier.name,
      subtitle: `${supplier.rating.toFixed(1)} rating · ${supplier.distanceKm.toFixed(1)} km away`,
      imageUri: supplier.logoUri,
    };
  }

  const agency = VERIFIED_CONSTRUCTION_AGENCIES.find((entry) => entry.id === item.id);
  if (!agency) {
    return null;
  }

  return {
    id: agency.id,
    type: 'agency',
    title: agency.name,
    subtitle: 'Construction Agency',
    imageUri: agency.logoUri,
  };
}
