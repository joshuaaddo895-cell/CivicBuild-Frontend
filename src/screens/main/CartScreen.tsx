import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CartScreenProps } from '@appTypes/navigation';
import { AuthPrimaryButton } from '@components/auth';
import { useCartStore } from '@store/cartStore';
import theme from '@theme/index';
import { formatCartLinePricing, formatCedis } from '@utils/paystackAmount';

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
        style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
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

export default function CartScreen({ navigation }: CartScreenProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const isEmpty = items.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="shopping-cart" size={56} color={theme.colors.outline} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse the marketplace to add materials to your cart.
          </Text>
          <AuthPrimaryButton
            label="Browse Marketplace"
            showArrow={false}
            onPress={() => navigation.navigate('HomeMain')}
          />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View key={item.productId} style={styles.cartItem}>
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.itemImage}
                  contentFit="cover"
                  accessibilityLabel={item.imageAlt}
                />
                <View style={styles.itemBody}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.supplierName ? (
                    <Text style={styles.itemSupplier}>{item.supplierName}</Text>
                  ) : null}
                  <Text style={styles.itemPricing}>
                    {formatCartLinePricing(item.price, item.quantity, item.unit)}
                  </Text>
                  <View style={styles.itemFooter}>
                    <QuantityStepper
                      quantity={item.quantity}
                      onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
                      onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
                    />
                  </View>
                </View>
                <Pressable
                  onPress={() => removeItem(item.productId)}
                  style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.name} from cart`}
                >
                  <MaterialIcons name="delete-outline" size={22} color={theme.colors.error} />
                </Pressable>
              </View>
            ))}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatCedis(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryTotal}>{formatCedis(subtotal)}</Text>
              </View>
              <Text style={styles.summaryNote}>
                Delivery fees and taxes will be calculated at checkout once delivery pricing is
                available.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <AuthPrimaryButton
              label="Proceed to Checkout"
              showArrow={false}
              onPress={() => navigation.navigate('Checkout')}
            />
          </View>
        </>
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.onSurface,
  },
  headerSpacer: {
    width: 32,
  },
  pressed: {
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.stackLg,
  },
  cartItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainer,
  },
  itemBody: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  itemSupplier: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
  itemPricing: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurface,
    marginTop: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xs,
  },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  stepperPressed: {
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  stepperValue: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurface,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    alignSelf: 'flex-start',
    padding: theme.spacing.xs,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  summaryTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  summaryValue: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
  },
  summaryTotal: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.primary,
  },
  summaryNote: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.onSurfaceVariant,
    marginTop: theme.spacing.sm,
  },
  footer: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
});
