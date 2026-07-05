import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { MarketplaceCategory } from '@appTypes/marketplace';
import theme from '@theme/index';

import CategoryChip from './CategoryChip';

interface CategoryChipListProps {
  categories: MarketplaceCategory[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
}

export default function CategoryChipList({
  categories,
  selectedId,
  onSelect,
}: CategoryChipListProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.label}
            selected={selectedId === category.id}
            onPress={() => onSelect(category.id)}
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
    gap: theme.spacing.sm,
  },
});
