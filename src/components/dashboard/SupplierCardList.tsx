import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { MarketplaceListing, Supplier } from '@appTypes/marketplace';
import theme from '@theme/index';

import SupplierCard from './SupplierCard';

interface SupplierCardListProps {
  suppliers: (Supplier | MarketplaceListing)[];
  isFavorite?: (supplierId: string) => boolean;
  onFavoritePress?: (supplierId: string) => void;
  onSupplierPress?: (supplierId: string) => void;
}

export default function SupplierCardList({
  suppliers,
  isFavorite,
  onFavoritePress,
  onSupplierPress,
}: SupplierCardListProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {suppliers.map((supplier) => (
          <SupplierCard
            key={`${'listingKind' in supplier ? supplier.listingKind : 'supplier'}-${supplier.id}`}
            supplier={supplier}
            isFavorite={isFavorite?.(supplier.id) ?? false}
            onFavoritePress={onFavoritePress ? () => onFavoritePress(supplier.id) : undefined}
            onPress={onSupplierPress ? () => onSupplierPress(supplier.id) : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: -theme.spacing.marginMobile,
  },
  content: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: theme.spacing.md,
  },
});
