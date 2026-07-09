import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SupplierDetailScreenProps } from '@appTypes/navigation';
import { AuthPrimaryButton } from '@components/auth';
import { ProductGrid } from '@components/dashboard';
import { getSupplierCategoryLabel, getSupplierProfile } from '@constants/supplierProfiles';
import { useCartStore } from '@store/cartStore';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';
import {
  findProductsBySupplier,
  findSupplierById,
  resolveMessageNavigationForSupplier,
} from '@utils/productHelpers';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <MaterialIcons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function SupplierDetailScreen({ navigation, route }: SupplierDetailScreenProps) {
  const { supplierId } = route.params;
  const supplier = findSupplierById(supplierId);
  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);
  const addProduct = useCartStore((state) => state.addProduct);

  const profile = useMemo(() => (supplier ? getSupplierProfile(supplier) : null), [supplier]);
  const categoryLabel = supplier ? getSupplierCategoryLabel(supplier) : '';
  const products = useMemo(() => (supplier ? findProductsBySupplier(supplier) : []), [supplier]);

  if (!supplier || !profile) {
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
          <Text style={styles.missingTitle}>Supplier not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleMessagePress = () => {
    const messageParams = resolveMessageNavigationForSupplier(supplier);
    navigation.getParent()?.navigate('Messages', {
      screen: 'ConversationDetail',
      params: messageParams,
    });
  };

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
            source={{ uri: supplier.logoUri }}
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
            <Text style={styles.tagline}>{profile.tagline}</Text>

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
          {profile.yearEstablished ? (
            <View style={styles.statPill}>
              <MaterialIcons name="history" size={16} color={theme.colors.primary} />
              <Text style={styles.statPillText}>Est. {profile.yearEstablished}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>About the business</Text>
        <View style={styles.card}>
          <Text style={styles.description}>{profile.description}</Text>
          <InfoRow icon="location-on" label="Address" value={profile.address} />
          <InfoRow icon="phone" label="Phone" value={profile.phone} />
          <InfoRow icon="schedule" label="Hours" value={profile.hours} />
        </View>

        <Text style={styles.sectionTitle}>Products from this supplier</Text>
        {products.length === 0 ? (
          <View style={styles.emptyProducts}>
            <Text style={styles.emptyProductsText}>
              No listed products yet. Message the supplier to request a quote.
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

      <View style={styles.footer}>
        <AuthPrimaryButton label="Message Us" showArrow={false} onPress={handleMessagePress} />
      </View>
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
  infoRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextBlock: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.labelMd,
  },
  infoValue: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurface,
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
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  missingTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
});
