import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAgency } from '@api/agencies';
import { getSuppliers } from '@api/catalog';
import type { Supplier } from '@appTypes/marketplace';
import type { HomeMainScreenProps } from '@appTypes/navigation';
import {
  CategoryChipList,
  DashboardHeader,
  DashboardSearchBar,
  ProductGrid,
  ScrollToTopButton,
  SectionHeader,
  SupplierCardList,
} from '@components/dashboard';
import { filterProductsByCategory } from '@constants/marketplaceData';
import { useMarketplaceCategories } from '@hooks/useMarketplaceCategories';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { useProductStore } from '@store/productStore';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';
import { getUserInitials } from '@utils/userInitials';

export default function HomeScreen({ navigation }: HomeMainScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { categories } = useMarketplaceCategories();
  const user = useAuthStore((state) => state.user);
  const deliveryProviderProfile = useAuthStore((state) => state.deliveryProviderProfile);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);

  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);
  const syncFromServer = useSavedStore((state) => state.syncFromServer);
  const addProduct = useCartStore((state) => state.addProduct);
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  const userInitials = getUserInitials(user, deliveryProviderProfile?.fullName);
  const userAvatarUri = user?.avatar ?? deliveryProviderProfile?.profileImageUri ?? null;

  const handleOpenProfile = () => {
    navigation.getParent()?.navigate('Profile', { screen: 'ProfileMain' });
  };

  const catalogProducts = useProductStore((state) => state.catalogProducts);
  const fetchCatalog = useProductStore((state) => state.fetchCatalog);
  const isLoadingCatalog = useProductStore((state) => state.isLoadingCatalog);

  const marketplaceProducts = useMemo(() => catalogProducts, [catalogProducts]);

  const loadSuppliers = useCallback(async () => {
    setIsLoadingSuppliers(true);
    setSuppliersError(null);

    const result = await getSuppliers({ limit: 10 });

    if (result.ok) {
      setSuppliers(result.data.items);
    } else {
      setSuppliers([]);
      setSuppliersError(result.error.message);
    }

    setIsLoadingSuppliers(false);
  }, []);

  useEffect(() => {
    void fetchCatalog();
    void loadSuppliers();
    void syncFromServer();
  }, [fetchCatalog, loadSuppliers, syncFromServer]);

  const filteredProducts = useMemo(() => {
    const byCategory = filterProductsByCategory(marketplaceProducts, selectedCategoryId);
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return byCategory;
    }

    return byCategory.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.supplierName && product.supplierName.toLowerCase().includes(query)),
    );
  }, [marketplaceProducts, searchQuery, selectedCategoryId]);

  const handleSupplierPress = async (supplierId: string) => {
    const agencyResult = await getAgency(supplierId);

    if (agencyResult.ok) {
      navigation.navigate('AgencyDetail', { agencyId: supplierId });
      return;
    }

    navigation.navigate('SupplierDetail', { supplierId });
  };

  const handleAddProduct = (productId: string) => {
    const product = marketplaceProducts.find((entry) => entry.id === productId);
    if (product) {
      addProduct(product);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(event.nativeEvent.contentOffset.y > 400);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DashboardHeader
        cartItemCount={cartItemCount}
        userInitials={userInitials}
        userAvatarUri={userAvatarUri}
        onAvatarPress={handleOpenProfile}
        onCartPress={() => navigation.navigate('Cart')}
        onSettingsPress={() => navigation.navigate('Settings')}
        onNotificationsPress={() => {}}
      />
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DashboardSearchBar value={searchQuery} onChangeText={setSearchQuery} />

        <CategoryChipList
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        <View style={styles.section}>
          <SectionHeader
            title="Trusted Suppliers Near You"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('AllSuppliers')}
          />
          {isLoadingSuppliers ? (
            <View style={styles.inlineState}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : suppliersError ? (
            <Text style={styles.errorText}>{suppliersError}</Text>
          ) : suppliers.length === 0 ? (
            <Text style={styles.emptyText}>No suppliers available yet.</Text>
          ) : (
            <SupplierCardList
              suppliers={suppliers}
              isFavorite={(id) => isSaved(id, 'supplier')}
              onFavoritePress={(id) => void toggleSaved(id, 'supplier')}
              onSupplierPress={(id) => void handleSupplierPress(id)}
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Popular Materials" actionLabel="Filter" onActionPress={() => {}} />
          {isLoadingCatalog ? (
            <View style={styles.inlineState}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : filteredProducts.length === 0 ? (
            <Text style={styles.emptyText}>No materials match your search.</Text>
          ) : (
            <ProductGrid
              products={filteredProducts}
              isFavorite={(id) => isSaved(id, 'product')}
              onProductPress={(id) => navigation.navigate('ProductDetail', { productId: id })}
              onFavoritePress={(id) => void toggleSaved(id, 'product')}
              onAddPress={handleAddProduct}
            />
          )}
        </View>
      </ScrollView>
      <ScrollToTopButton
        visible={showScrollTop}
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        bottomOffset={24}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
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
  inlineState: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});
