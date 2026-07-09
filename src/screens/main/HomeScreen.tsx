import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { isConstructionAgencyId } from '@constants/agencyProfiles';
import {
  DASHBOARD_SUPPLIERS,
  filterProductsByCategory,
  MARKETPLACE_CATEGORIES,
} from '@constants/marketplaceData';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { useProductStore } from '@store/productStore';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';
import { getUserInitials } from '@utils/userInitials';

export default function HomeScreen({ navigation }: HomeMainScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const user = useAuthStore((state) => state.user);
  const deliveryProviderProfile = useAuthStore((state) => state.deliveryProviderProfile);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);
  const addProduct = useCartStore((state) => state.addProduct);
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  const userInitials = getUserInitials(user, deliveryProviderProfile?.fullName);
  const userAvatarUri = user?.avatar ?? deliveryProviderProfile?.profileImageUri ?? null;

  const handleOpenProfile = () => {
    navigation.getParent()?.navigate('Profile', { screen: 'ProfileMain' });
  };

  const extraProducts = useProductStore((state) => state.extraProducts);
  const removedProductIds = useProductStore((state) => state.removedProductIds);
  const productOverrides = useProductStore((state) => state.productOverrides);
  const initializeProducts = useProductStore((state) => state.initialize);
  const getAllProducts = useProductStore((state) => state.getAllProducts);

  const marketplaceProducts = useMemo(
    () => getAllProducts(),
    [extraProducts, getAllProducts, productOverrides, removedProductIds],
  );

  useEffect(() => {
    initializeProducts();
  }, [initializeProducts]);

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

  const handleSupplierPress = (supplierId: string) => {
    if (isConstructionAgencyId(supplierId)) {
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
          categories={MARKETPLACE_CATEGORIES}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        <View style={styles.section}>
          <SectionHeader
            title="Trusted Suppliers Near You"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('AllSuppliers')}
          />
          <SupplierCardList
            suppliers={DASHBOARD_SUPPLIERS}
            isFavorite={(id) => isSaved(id, 'supplier')}
            onFavoritePress={(id) => toggleSaved(id, 'supplier')}
            onSupplierPress={handleSupplierPress}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Popular Materials" actionLabel="Filter" onActionPress={() => {}} />
          <ProductGrid
            products={filteredProducts}
            isFavorite={(id) => isSaved(id, 'product')}
            onProductPress={(id) => navigation.navigate('ProductDetail', { productId: id })}
            onFavoritePress={(id) => toggleSaved(id, 'product')}
            onAddPress={handleAddProduct}
          />
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
});
