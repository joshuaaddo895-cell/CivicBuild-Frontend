import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { Supplier } from '@appTypes/marketplace';
import theme from '@theme/index';

import SupplierCard from './SupplierCard';

interface SupplierCardListProps {
  suppliers: Supplier[];
  isFavorite?: (supplierId: string) => boolean;
  onFavoritePress?: (supplierId: string) => void;
}

export default function SupplierCardList({
  suppliers,
  isFavorite,
  onFavoritePress,
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
            key={supplier.id}
            supplier={supplier}
            isFavorite={isFavorite?.(supplier.id) ?? false}
            onFavoritePress={onFavoritePress ? () => onFavoritePress(supplier.id) : undefined}
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
