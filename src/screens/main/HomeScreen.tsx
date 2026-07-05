import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeScreenProps } from '@appTypes/navigation';
import {
  CategoryChipList,
  DashboardHeader,
  DashboardSearchBar,
  ProductGrid,
  SectionHeader,
  SupplierCardList,
} from '@components/dashboard';
import {
  filterProductsByCategory,
  MARKETPLACE_CATEGORIES,
  POPULAR_PRODUCTS,
  TRUSTED_SUPPLIERS,
} from '@constants/marketplaceData';
import theme from '@theme/index';

export default function HomeScreen(_props: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const filteredProducts = useMemo(() => {
    const byCategory = filterProductsByCategory(POPULAR_PRODUCTS, selectedCategoryId);
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return byCategory;
    }

    return byCategory.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query),
    );
  }, [searchQuery, selectedCategoryId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DashboardHeader />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DashboardSearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <CategoryChipList
          categories={MARKETPLACE_CATEGORIES}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        <View style={styles.section}>
          <SectionHeader
            title="Trusted Suppliers Near You"
            actionLabel="See All"
            onActionPress={() => {}}
          />
          <SupplierCardList suppliers={TRUSTED_SUPPLIERS} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Popular Materials" actionLabel="Filter" onActionPress={() => {}} />
          <ProductGrid products={filteredProducts} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackMd,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.stackMd,
  },
  section: {
    marginTop: theme.spacing.stackSm,
  },
});
