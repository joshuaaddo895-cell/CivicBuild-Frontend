import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProducts, getSupplier } from '@api/catalog';
import type { Product, Supplier } from '@appTypes/marketplace';
import type { SupplierDetailScreenProps } from '@appTypes/navigation';
import { ProductGrid } from '@components/dashboard';
import { resolveSupplierLogoUri } from '@constants/placeholderImages';
import { useMarketplaceCategories } from '@hooks/useMarketplaceCategories';
import { useCartStore } from '@store/cartStore';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';

export default function SupplierDetailScreen({ navigation, route }: SupplierDetailScreenProps) {
  const { supplierId } = route.params;
  const { categories } = useMarketplaceCategories();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);
  const addProduct = useCartStore((state) => state.addProduct);

  const loadSupplier = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const [supplierResult, productsResult] = await Promise.all([
      getSupplier(supplierId),
      getProducts({ supplierId, limit: 20 }),
    ]);

    if (!supplierResult.ok) {
      setSupplier(null);
      setProducts([]);
      setError(supplierResult.error.message);
      setIsLoading(false);
      return;
    }

    setSupplier(supplierResult.data);
    setProducts(productsResult.ok ? productsResult.data.items : []);
    setIsLoading(false);
  }, [supplierId]);

  useEffect(() => {
    void loadSupplier();
  }, [loadSupplier]);

  const categoryLabel = useMemo(() => {
    if (!supplier) {
      return 'Materials';
    }

    return categories.find((category) => category.id === supplier.categoryId)?.label ?? 'Materials';
  }, [categories, supplier]);

  const tagline = supplier ? `Trusted ${categoryLabel.toLowerCase()} supplier on CivicBuild` : '';
  const description = supplier
    ? supplier.verified
      ? `${supplier.name} is a verified supplier on CivicBuild. Browse their listed products below or contact a construction agency for project help.`
      : `${supplier.name} lists ${categoryLabel.toLowerCase()} on CivicBuild. Browse their products below or contact a construction agency for project help.`
    : '';

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !supplier) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Supplier</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.missingState}>
          <Text style={styles.missingTitle}>{error || 'Supplier not found'}</Text>
          <Pressable
            onPress={() => void loadSupplier()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleReviewsPress = () => {
    navigation.navigate('Reviews', {
      subjectType: 'supplier',
      subjectId: supplier.id,
      subjectName: supplier.name,
    });
  };

  const handleAddProduct = (productId: string) => {
    const product = products.find((entry) => entry.id === productId);
    if (product) {
      addProduct(product);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {supplier.name}
        </Text>
        <Pressable
          onPress={() => toggleSaved(supplier.id, 'supplier')}
          style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={
            isSaved(supplier.id, 'supplier') ? 'Remove from favorites' : 'Save to favorites'
          }
        >
          <MaterialIcons
            name={isSaved(supplier.id, 'supplier') ? 'favorite' : 'favorite-border'}
            size={24}
            color={
              isSaved(supplier.id, 'supplier') ? theme.colors.error : theme.colors.onSurfaceVariant
            }
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image
            source={{ uri: resolveSupplierLogoUri(supplier.logoUri) }}
            style={styles.logo}
            contentFit="cover"
            accessibilityLabel={`${supplier.name} logo`}
          />

          <View style={styles.heroTextBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{supplier.name}</Text>
              {supplier.verified ? (
                <MaterialIcons name="verified" size={20} color={theme.colors.primary} />
              ) : null}
            </View>
            <Text style={styles.tagline}>{tagline}</Text>

            <Pressable
              onPress={handleReviewsPress}
              style={({ pressed }) => [styles.ratingRow, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`${supplier.rating} stars, ${supplier.reviewCount} reviews`}
            >
              <MaterialIcons name="star" size={16} color={theme.colors.primary} />
              <Text style={styles.ratingText}>
                {supplier.rating.toFixed(1)} · {supplier.reviewCount} reviews
              </Text>
              <MaterialIcons name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.statPill}>
            <MaterialIcons name="place" size={16} color={theme.colors.primary} />
            <Text style={styles.statPillText}>{supplier.distanceKm.toFixed(1)} km away</Text>
          </View>
          <View style={styles.statPill}>
            <MaterialIcons name="category" size={16} color={theme.colors.primary} />
            <Text style={styles.statPillText}>{categoryLabel}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About the business</Text>
        <View style={styles.card}>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.contactHint}>
            <MaterialIcons name="chat" size={18} color={theme.colors.primary} />
            <Text style={styles.contactHintText}>
              Direct supplier messaging is coming soon. Browse products below or message a
              construction agency from the home screen.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Products from this supplier</Text>
        {products.length === 0 ? (
          <View style={styles.emptyProducts}>
            <Text style={styles.emptyProductsText}>
              No listed products yet. Check back later or browse other suppliers.
            </Text>
          </View>
        ) : (
          <ProductGrid
            products={products}
            isFavorite={(id) => isSaved(id, 'product')}
            onProductPress={(id) => navigation.navigate('ProductDetail', { productId: id })}
            onFavoritePress={(id) => toggleSaved(id, 'product')}
            onAddPress={handleAddProduct}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  favoriteButton: {
    padding: theme.spacing.xs,
    width: 40,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  headerSpacer: {
    width: 40,
  },
  pressed: {
    opacity: 0.75,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.stackMd,
  },
  heroCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceContainer,
  },
  heroTextBlock: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  name: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  tagline: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  ratingText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  statPillText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  description: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  contactHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryContainer,
  },
  contactHintText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onPrimaryContainer,
  },
  emptyProducts: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  emptyProductsText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  messageError: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
    textAlign: 'center',
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  retryText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
});
