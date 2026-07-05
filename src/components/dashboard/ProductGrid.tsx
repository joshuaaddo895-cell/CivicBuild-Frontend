import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { Product } from '@appTypes/marketplace';
import theme from '@theme/index';

import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <View key={product.id} style={styles.gridItem}>
          <ProductCard product={product} />
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
