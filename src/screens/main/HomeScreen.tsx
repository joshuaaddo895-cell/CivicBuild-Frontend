import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRecentAgencyPosts, listAgencies, type AgencyPostFeedItem } from '@api/agencies';
import { getSuppliers } from '@api/catalog';
import type { MarketplaceListing } from '@appTypes/marketplace';
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
import { getAgencyPostCategoryLabel } from '@constants/agencyPostLabels';
import { filterProductsByCategory } from '@constants/marketplaceData';
import { useMarketplaceCategories } from '@hooks/useMarketplaceCategories';
import { useUnreadInboxSync } from '@hooks/useUnreadInboxSync';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { useInboxStore } from '@store/inboxStore';
import { useProductStore } from '@store/productStore';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';
import { isAgencyListing, mergeMarketplaceListings } from '@utils/marketplaceDirectory';
import { getUserInitials } from '@utils/userInitials';

export default function HomeScreen({ navigation }: HomeMainScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { categories } = useMarketplaceCategories();
  const user = useAuthStore((state) => state.user);
  const deliveryProviderProfile = useAuthStore((state) => state.deliveryProviderProfile);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [agencyPosts, setAgencyPosts] = useState<AgencyPostFeedItem[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [suppliersError, setSuppliersError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);

  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);
  const syncFromServer = useSavedStore((state) => state.syncFromServer);
  const addProduct = useCartStore((state) => state.addProduct);
  const cartItemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const unreadNotificationCount = useInboxStore((state) => state.unreadNotificationCount);

  useUnreadInboxSync();

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

    const [suppliersResult, agenciesResult] = await Promise.all([
      getSuppliers({ limit: 10 }),
      listAgencies(undefined, 0, 10),
    ]);

    if (!suppliersResult.ok && !agenciesResult.ok) {
      setListings([]);
      setSuppliersError(suppliersResult.error.message || agenciesResult.error.message);
      setIsLoadingSuppliers(false);
      return;
    }

    const suppliers = suppliersResult.ok ? suppliersResult.data.items : [];
    const agencies = agenciesResult.ok ? agenciesResult.data.items : [];
    setListings(mergeMarketplaceListings(suppliers, agencies));
    setIsLoadingSuppliers(false);
  }, []);

  const loadAgencyPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    setPostsError(null);

    const result = await getRecentAgencyPosts(6);
    if (result.ok) {
      setAgencyPosts(result.data);
    } else {
      setAgencyPosts([]);
      setPostsError(result.error.message);
    }

    setIsLoadingPosts(false);
  }, []);

  useEffect(() => {
    void fetchCatalog();
    void loadSuppliers();
    void loadAgencyPosts();
    void syncFromServer();
  }, [fetchCatalog, loadAgencyPosts, loadSuppliers, syncFromServer]);

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

  const handleListingPress = (listing: MarketplaceListing) => {
    if (isAgencyListing(listing)) {
      navigation.navigate('AgencyDetail', { agencyId: listing.id });
      return;
    }

    navigation.navigate('SupplierDetail', { supplierId: listing.id });
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
        hasUnreadNotifications={unreadNotificationCount > 0}
        onNotificationsPress={() => navigation.navigate('Notifications')}
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
            title="Suppliers & Agencies Near You"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('AllSuppliers')}
          />
          {isLoadingSuppliers ? (
            <View style={styles.inlineState}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : suppliersError ? (
            <Text style={styles.errorText}>{suppliersError}</Text>
          ) : listings.length === 0 ? (
            <Text style={styles.emptyText}>No suppliers or agencies available yet.</Text>
          ) : (
            <SupplierCardList
              suppliers={listings}
              isFavorite={(id) => isSaved(id, 'supplier') || isSaved(id, 'agency')}
              onFavoritePress={(id) => {
                const listing = listings.find((entry) => entry.id === id);
                void toggleSaved(id, listing && isAgencyListing(listing) ? 'agency' : 'supplier');
              }}
              onSupplierPress={(id) => {
                const listing = listings.find((entry) => entry.id === id);
                if (listing) {
                  handleListingPress(listing);
                }
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Agency Posts"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('AllSuppliers')}
          />
          {isLoadingPosts ? (
            <View style={styles.inlineState}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : postsError ? (
            <Text style={styles.errorText}>{postsError}</Text>
          ) : agencyPosts.length === 0 ? (
            <Text style={styles.emptyText}>No agency posts yet.</Text>
          ) : (
            agencyPosts.map((post) => (
              <Pressable
                key={post.id}
                onPress={() => navigation.navigate('AgencyDetail', { agencyId: post.agencyId })}
                style={({ pressed }) => [styles.postCard, pressed && styles.postCardPressed]}
                accessibilityRole="button"
                accessibilityLabel={`${post.title} from ${post.agencyName}`}
              >
                <View style={styles.postCardHeader}>
                  <Text style={styles.postCategory}>{getAgencyPostCategoryLabel(post.type)}</Text>
                  <Text style={styles.postAgency}>{post.agencyName}</Text>
                </View>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postDescription} numberOfLines={2}>
                  {post.description}
                </Text>
              </Pressable>
            ))
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
  postCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  postCardPressed: {
    opacity: 0.85,
  },
  postCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  postCategory: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  postAgency: {
    flex: 1,
    textAlign: 'right',
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  postTitle: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  postDescription: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
    lineHeight: theme.typography.lineHeight.bodySm,
  },
});
