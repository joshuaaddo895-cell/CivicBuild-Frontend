import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CheckoutFormData } from '@appTypes/cart';
import type { CheckoutScreenProps } from '@appTypes/navigation';
import { AuthInput, AuthPrimaryButton } from '@components/auth';
import { GHANA_REGIONS } from '@constants/ghanaRegions';
import { initializeCheckout } from '@services/checkoutService';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import theme from '@theme/index';
import { formatCartLinePricing, formatCedis } from '@utils/paystackAmount';
import { isValidGhanaPhone } from '@utils/phoneValidation';

const PAYMENT_CHANNELS = [
  { id: 'card', label: 'Card', icon: 'credit-card' as const },
  { id: 'mobile_money', label: 'Mobile Money', icon: 'phone-iphone' as const },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: 'account-balance' as const },
];

export default function CheckoutScreen({ navigation }: CheckoutScreenProps) {
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const defaultFullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';

  const [email, setEmail] = useState(user?.email ?? '');
  const [fullName, setFullName] = useState(defaultFullName);
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('card');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryAddressPreview = useMemo(() => {
    const parts = [streetAddress, city, region].filter(Boolean);
    return parts.join(', ');
  }, [streetAddress, city, region]);

  const validateForm = (): CheckoutFormData | null => {
    if (!email.trim()) {
      setError('Email address is required for payment.');
      return null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return null;
    }
    if (!fullName.trim()) {
      setError('Full name is required.');
      return null;
    }
    if (!isValidGhanaPhone(phone)) {
      setError('Enter a valid Ghana phone number (e.g. 0241234567).');
      return null;
    }
    if (!streetAddress.trim() || !city.trim() || !region) {
      setError('Complete your delivery address including region.');
      return null;
    }

    setError(null);
    return {
      email: email.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      region,
    };
  };

  const handlePayNow = async () => {
    const customer = validateForm();
    if (!customer || items.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await initializeCheckout({
        items,
        subtotal,
        total: subtotal,
        currency: 'GHS',
        customer,
      });

      navigation.navigate('PaymentWebView', {
        authorizationUrl: result.authorizationUrl,
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        reference: result.reference,
        amountPaid: subtotal,
        deliveryAddress: deliveryAddressPreview,
      });
    } catch {
      setError('Unable to start checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
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
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <AuthPrimaryButton
            label="Back to Cart"
            showArrow={false}
            onPress={() => navigation.navigate('Cart')}
          />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Contact Details</Text>
        <View style={styles.formGroup}>
          <AuthInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <AuthInput
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
          />
          <AuthInput
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="0241234567"
          />
        </View>

        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.formGroup}>
          <AuthInput
            label="Street address"
            value={streetAddress}
            onChangeText={setStreetAddress}
            autoComplete="street-address"
          />
          <AuthInput label="City / Town" value={city} onChangeText={setCity} />
          <Pressable
            onPress={() => setRegionModalVisible(true)}
            style={({ pressed }) => [styles.regionPicker, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Select region"
          >
            <Text style={styles.regionLabel}>Region</Text>
            <View style={styles.regionValueRow}>
              <Text style={[styles.regionValue, !region && styles.regionPlaceholder]}>
                {region || 'Select region'}
              </Text>
              <MaterialIcons name="expand-more" size={22} color={theme.colors.onSurfaceVariant} />
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <Text style={styles.sectionHint}>
          Payment details are entered securely on Paystack&apos;s hosted checkout — not in this app.
        </Text>
        <View style={styles.channelList}>
          {PAYMENT_CHANNELS.map((channel) => {
            const selected = selectedChannel === channel.id;
            return (
              <Pressable
                key={channel.id}
                onPress={() => setSelectedChannel(channel.id)}
                style={({ pressed }) => [
                  styles.channelCard,
                  selected && styles.channelCardSelected,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${channel.label}${selected ? ', selected' : ''}`}
                accessibilityState={{ selected }}
              >
                <MaterialIcons
                  name={channel.icon}
                  size={22}
                  color={selected ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text style={[styles.channelLabel, selected && styles.channelLabelSelected]}>
                  {channel.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryCard}>
          {items.map((item) => (
            <View key={item.productId} style={styles.summaryItemBlock}>
              <Text style={styles.summaryItemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.summaryItemPrice}>
                {formatCartLinePricing(item.price, item.quantity, item.unit)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatCedis(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryTotal}>{formatCedis(subtotal)}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <AuthPrimaryButton
          label="Pay Now"
          showArrow={false}
          loading={isSubmitting}
          onPress={handlePayNow}
          disabled={isSubmitting}
        />
      </View>

      <Modal visible={regionModalVisible} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setRegionModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>Select Region</Text>
            <ScrollView>
              {GHANA_REGIONS.map((entry) => (
                <Pressable
                  key={entry}
                  onPress={() => {
                    setRegion(entry);
                    setRegionModalVisible(false);
                  }}
                  style={({ pressed }) => [styles.regionOption, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={entry}
                >
                  <Text
                    style={[
                      styles.regionOptionText,
                      region === entry && styles.regionOptionTextSelected,
                    ]}
                  >
                    {entry}
                  </Text>
                  {region === entry ? (
                    <MaterialIcons name="check" size={20} color={theme.colors.primary} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    color: theme.colors.onSurface,
  },
  headerSpacer: {
    width: 32,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.stackLg,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  sectionHint: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.onSurfaceVariant,
    marginTop: -theme.spacing.sm,
  },
  formGroup: {
    gap: theme.spacing.md,
  },
  regionPicker: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  regionLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  regionValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regionValue: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
  },
  regionPlaceholder: {
    color: theme.colors.onSurfaceVariant,
  },
  channelList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  channelCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  channelLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  channelLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  summaryItemBlock: {
    gap: 2,
  },
  summaryItemName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  summaryItemPrice: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    marginVertical: theme.spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  loader: {
    marginTop: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '70%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
  },
  regionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  regionOptionText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
  },
  regionOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
