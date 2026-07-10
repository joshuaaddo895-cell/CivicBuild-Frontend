import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getReviewSummary } from '@api/reviews';
import type { ProductDetailScreenProps } from '@appTypes/navigation';
import type { ReviewSummary } from '@appTypes/reviewsApi';
import { AuthPrimaryButton } from '@components/auth';
import ResendSuccessToast from '@components/auth/ResendSuccessToast';
import { getCategoryTheme } from '@constants/categoryTheme';
import { useCartStore } from '@store/cartStore';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';
import { formatPriceWithUnit, formatUnitSuffix } from '@utils/paystackAmount';
import { enrichProduct, usesNumericQuantityInput } from '@utils/productEnrichment';
import { findProductById, resolveSupplierForProduct } from '@utils/productHelpers';

function FloatingIconButton({
  icon,
  onPress,
  accessibilityLabel,
  iconColor = theme.colors.onSurface,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  iconColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.floatingButton, pressed && styles.floatingButtonPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <MaterialIcons name={icon} size={22} color={iconColor} />
    </Pressable>
  );
}

function QuickInfoPill({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.quickInfoPill}>
      <Text style={styles.quickInfoPillText}>
        {icon} {label}
      </Text>
    </View>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.specItem}>
      <MaterialIcons name={icon} size={22} color={theme.colors.primary} />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={onDecrease}
        disabled={quantity <= 1}
        style={({ pressed }) => [
          styles.stepperButton,
          quantity <= 1 && styles.stepperButtonDisabled,
          pressed && styles.stepperPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <MaterialIcons name="remove" size={18} color={theme.colors.onSurface} />
      </Pressable>
      <Text style={styles.stepperValue}>{quantity}</Text>
      <Pressable
        onPress={onIncrease}
        style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <MaterialIcons name="add" size={18} color={theme.colors.onSurface} />
      </Pressable>
    </View>
  );
}

export default function ProductDetailScreen({ navigation, route }: ProductDetailScreenProps) {
  const { productId } = route.params;
  const rawProduct = findProductById(productId);
  const product = useMemo(() => (rawProduct ? enrichProduct(rawProduct) : undefined), [rawProduct]);

  const addProduct = useCartStore((state) => state.addProduct);
  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved(productId, 'product'));

  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [toastVisible, setToastVisible] = useState(false);

  const categoryTheme = product ? getCategoryTheme(product.category) : null;
  const supplier = product ? resolveSupplierForProduct(product) : undefined;
  const [productReviewSummary, setProductReviewSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalCount: 0,
    breakdown: [],
  });

  useEffect(() => {
    void (async () => {
      const result = await getReviewSummary('product', productId);
      if (result.ok) {
        setProductReviewSummary(result.data);
      }
    })();
  }, [productId]);
  const unitSuffix = product ? formatUnitSuffix(product.unit) : null;
  const useNumericInput = product ? usesNumericQuantityInput(product.unit) : false;
  const inStock = product?.inStock ?? product?.in_stock ?? true;

  const handleToggleSaved = useCallback(() => {
    toggleSaved(productId, 'product');
  }, [productId, toggleSaved]);

  const handleShare = useCallback(async () => {
    if (!product) {
      return;
    }

    try {
      await Share.share({
        message: `${product.name} — ${formatPriceWithUnit(product.price, product.unit)} on CivicBuild`,
      });
    } catch {
      // User dismissed share sheet — no action needed.
    }
  }, [product]);

  const handleMessageSupplier = useCallback(() => {
    if (!product) {
      navigation.getParent()?.navigate('Messages', { screen: 'MessagesList' });
      return;
    }

    const supplier = resolveSupplierForProduct(product);
    if (supplier) {
      navigation.getParent()?.navigate('Messages', { screen: 'MessagesList' });
      return;
    }

    navigation.getParent()?.navigate('Messages', { screen: 'MessagesList' });
  }, [navigation, product]);

  const handleOpenProductReviews = useCallback(() => {
    if (!product) {
      return;
    }

    navigation.navigate('Reviews', {
      subjectType: 'product',
      subjectId: productId,
      subjectName: product.name,
    });
  }, [navigation, product, productId]);

  const handleOpenSupplierReviews = useCallback(() => {
    if (!supplier) {
      return;
    }

    navigation.navigate('Reviews', {
      subjectType: 'supplier',
      subjectId: supplier.id,
      subjectName: supplier.name,
    });
  }, [navigation, supplier]);

  const parsedQuantity = useMemo(() => {
    if (!useNumericInput) {
      return quantity;
    }

    const parsed = Number.parseFloat(quantityInput.replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [quantity, quantityInput, useNumericInput]);

  const handleAddToCart = useCallback(() => {
    if (!product) {
      return;
    }

    addProduct(product, parsedQuantity);
    setToastVisible(true);
  }, [addProduct, parsedQuantity, product]);

  if (!product || !categoryTheme) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <MaterialIcons name="inventory-2" size={48} color={theme.colors.outline} />
          <Text style={styles.notFoundTitle}>Product not found</Text>
          <Text style={styles.notFoundSubtitle}>
            This listing may have been removed or is no longer available.
          </Text>
          <AuthPrimaryButton
            label="Go Back"
            showArrow={false}
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const heroBadge = supplier
    ? `${supplier.distanceKm.toFixed(1)} km`
    : `${categoryTheme.emoji} ${categoryTheme.label}`;

  const brandValue = product.brand ?? product.supplierName ?? '—';
  const sizeValue = product.size ?? 'See product name';
  const specValue = product.spec ?? 'Standard grade';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Image
            source={{ uri: product.imageUri }}
            style={styles.heroImage}
            contentFit="cover"
            accessibilityLabel={product.imageAlt ?? product.name}
            transition={200}
          />
          <View style={styles.heroOverlayTop}>
            <FloatingIconButton
              icon="arrow-back"
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back to marketplace"
            />
            <View style={styles.heroOverlayTopRight}>
              <FloatingIconButton
                icon="share"
                onPress={handleShare}
                accessibilityLabel={`Share ${product.name}`}
              />
              <FloatingIconButton
                icon={isSaved ? 'favorite' : 'favorite-border'}
                onPress={handleToggleSaved}
                iconColor={isSaved ? theme.colors.error : theme.colors.onSurface}
                accessibilityLabel={
                  isSaved ? `Remove ${product.name} from favorites` : `Save ${product.name}`
                }
              />
            </View>
          </View>
          <View style={styles.heroBadge}>
            <MaterialIcons
              name={supplier ? 'place' : 'category'}
              size={14}
              color={theme.colors.onPrimaryContainer}
            />
            <Text style={styles.heroBadgeText}>{heroBadge}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              {product.supplierName ? (
                <View style={styles.supplierRow}>
                  <MaterialIcons name="store" size={14} color={theme.colors.onSurfaceVariant} />
                  <Text style={styles.supplierName}>{product.supplierName}</Text>
                </View>
              ) : null}
              <Text style={styles.productName}>{product.name}</Text>
              <Pressable
                onPress={handleOpenProductReviews}
                style={({ pressed }) => [styles.ratingRow, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`${productReviewSummary.averageRating.toFixed(1)} stars, ${productReviewSummary.totalCount} reviews`}
              >
                <MaterialIcons name="star" size={16} color={theme.colors.primary} />
                <Text style={styles.ratingText}>
                  {productReviewSummary.averageRating.toFixed(1)} ·{' '}
                  {productReviewSummary.totalCount} reviews
                </Text>
              </Pressable>
            </View>
            <Pressable
              onPress={handleToggleSaved}
              style={({ pressed }) => [styles.titleFavoriteButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={
                isSaved ? `Remove ${product.name} from favorites` : `Save ${product.name}`
              }
            >
              <MaterialIcons
                name={isSaved ? 'favorite' : 'favorite-border'}
                size={24}
                color={isSaved ? theme.colors.error : theme.colors.onSurfaceVariant}
              />
            </Pressable>
          </View>

          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: categoryTheme.backgroundColor,
              },
            ]}
          >
            <Text style={[styles.categoryPillText, { color: categoryTheme.textColor }]}>
              {categoryTheme.emoji} {categoryTheme.label}
            </Text>
          </View>

          {product.highlight ? <Text style={styles.highlight}>{product.highlight}</Text> : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickInfoRow}
          >
            <QuickInfoPill icon="📦" label={unitSuffix ? `Per ${unitSuffix}` : 'Per unit'} />
            <QuickInfoPill
              icon={inStock ? '✅' : '❌'}
              label={inStock ? 'In Stock' : 'Out of Stock'}
            />
            <QuickInfoPill icon="🚚" label={product.deliveryEstimate ?? '2-3 days'} />
          </ScrollView>
          <Text style={styles.deliveryNote}>
            Delivery estimate is approximate — real timing pending delivery provider integration.
          </Text>

          <View style={styles.specGrid}>
            <SpecItem icon="business" label="Brand" value={brandValue} />
            <SpecItem icon="scale" label="Size" value={sizeValue} />
            <SpecItem icon="tune" label="Spec" value={specValue} />
          </View>

          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this product</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : null}

          <View style={styles.supplierCard}>
            <View style={styles.supplierCardHeader}>
              <View style={styles.supplierCardAvatar}>
                {supplier?.logoUri ? (
                  <Image
                    source={{ uri: supplier.logoUri }}
                    style={styles.supplierLogo}
                    contentFit="cover"
                    accessibilityLabel={`${product.supplierName} logo`}
                  />
                ) : (
                  <MaterialIcons name="store" size={24} color={theme.colors.primary} />
                )}
              </View>
              <View style={styles.supplierCardInfo}>
                <View style={styles.supplierCardNameRow}>
                  <Text style={styles.supplierCardName} numberOfLines={1}>
                    {product.supplierName ?? 'Marketplace supplier'}
                  </Text>
                  {supplier?.verified ? (
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="verified" size={14} color={theme.colors.primary} />
                      <Text style={styles.verifiedText}>Verified Supplier</Text>
                    </View>
                  ) : null}
                </View>
                <Pressable
                  onPress={supplier ? handleOpenSupplierReviews : undefined}
                  disabled={!supplier}
                  style={({ pressed }) => [pressed && supplier && styles.pressed]}
                  accessibilityRole={supplier ? 'button' : undefined}
                  accessibilityLabel={
                    supplier
                      ? `${supplier.rating.toFixed(1)} stars, ${supplier.reviewCount} supplier reviews`
                      : undefined
                  }
                >
                  <Text style={[styles.supplierCardSubtitle, supplier && styles.linkText]}>
                    {supplier
                      ? `${supplier.rating.toFixed(1)} ★ · ${supplier.reviewCount} reviews · ${supplier.distanceKm.toFixed(1)} km away`
                      : 'Contact this supplier for quotes and delivery'}
                  </Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              onPress={handleMessageSupplier}
              style={({ pressed }) => [styles.messageButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`Message ${product.supplierName ?? 'supplier'}`}
            >
              <MaterialIcons name="chat" size={18} color={theme.colors.primary} />
              <Text style={styles.messageButtonText}>Message Supplier</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.toastContainer}>
        <ResendSuccessToast
          message="Added to cart"
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
          durationMs={2500}
        />
      </View>

      <SafeAreaView style={styles.stickyBar} edges={['bottom']}>
        <View style={styles.stickyTopRow}>
          <Text style={styles.stickyPrice}>{formatPriceWithUnit(product.price, product.unit)}</Text>
          {useNumericInput ? (
            <View style={styles.numericInputWrapper}>
              <TextInput
                style={styles.numericInput}
                value={quantityInput}
                onChangeText={setQuantityInput}
                keyboardType="decimal-pad"
                accessibilityLabel={`Quantity in ${unitSuffix ?? 'units'}`}
              />
              {unitSuffix ? <Text style={styles.numericInputUnit}>{unitSuffix}</Text> : null}
            </View>
          ) : (
            <QuantityStepper
              quantity={quantity}
              onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
              onIncrease={() => setQuantity((current) => current + 1)}
            />
          )}
        </View>
        <Pressable
          onPress={handleAddToCart}
          style={({ pressed }) => [styles.addToCartButton, pressed && styles.addToCartPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Add ${parsedQuantity} ${product.name} to cart`}
        >
          <MaterialIcons name="shopping-cart" size={20} color={theme.colors.onPrimary} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </Pressable>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const HERO_HEIGHT = 300;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  heroSection: {
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: theme.colors.surfaceContainer,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: theme.borderRadius['2xl'],
    borderBottomRightRadius: theme.borderRadius['2xl'],
  },
  heroOverlayTop: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroOverlayTopRight: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  floatingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  floatingButtonPressed: {
    transform: [{ scale: 0.94 }],
  },
  heroBadge: {
    position: 'absolute',
    left: theme.spacing.md,
    bottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  heroBadgeText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: theme.spacing.gutter,
    paddingTop: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  supplierName: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  productName: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineMd,
    lineHeight: theme.typography.lineHeight.headlineMd,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: theme.spacing.xs,
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  titleFavoriteButton: {
    padding: theme.spacing.xs,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  categoryPillText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    fontWeight: '700',
  },
  highlight: {
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  quickInfoRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingRight: theme.spacing.gutter,
  },
  quickInfoPill: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  quickInfoPillText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.onSurface,
  },
  deliveryNote: {
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.outline,
    fontStyle: 'italic',
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  specItem: {
    width: '31%',
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  specLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  specValue: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurface,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.onSurface,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  supplierCard: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  supplierCardHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  supplierCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  supplierLogo: {
    width: '100%',
    height: '100%',
  },
  supplierCardInfo: {
    flex: 1,
    gap: 4,
  },
  supplierCardNameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  supplierCardName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '700',
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  verifiedText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.onPrimaryContainer,
  },
  supplierCardSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.75,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.sm,
  },
  messageButtonText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 130,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    paddingHorizontal: theme.spacing.gutter,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  stickyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  stickyPrice: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  stepperButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  stepperPressed: {
    opacity: 0.7,
  },
  stepperValue: {
    minWidth: 28,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  numericInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingHorizontal: theme.spacing.sm,
    gap: 4,
  },
  numericInput: {
    minWidth: 56,
    paddingVertical: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    textAlign: 'right',
  },
  numericInputUnit: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
  },
  addToCartPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  addToCartText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onPrimary,
    fontWeight: '700',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.gutter,
    gap: theme.spacing.md,
  },
  notFoundTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  notFoundSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
