import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Product } from '@appTypes/marketplace';
import theme from '@theme/index';

import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isFavorite?: (productId: string) => boolean;
  onFavoritePress?: (productId: string) => void;
  onAddPress?: (productId: string) => void;
}

export default function ProductGrid({
  products,
  isFavorite,
  onFavoritePress,
  onAddPress,
}: ProductGridProps) {
  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <View key={product.id} style={styles.gridItem}>
          <ProductCard
            product={product}
            isFavorite={isFavorite?.(product.id) ?? false}
            onFavoritePress={() => onFavoritePress?.(product.id)}
            onQuotePress={() => onAddPress?.(product.id)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.stackSm,
  },
  gridItem: {
    width: '48%',
  },
});
