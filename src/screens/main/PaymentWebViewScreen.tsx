import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import type { PaymentWebViewScreenProps } from '@appTypes/navigation';
import { AuthPrimaryButton } from '@components/auth';
import { useCartStore } from '@store/cartStore';
import theme from '@theme/index';
import {
  isMockCheckoutUrl,
  isPaymentCallbackUrl,
  parsePaymentCallbackUrl,
} from '@utils/mockCheckout';
import { formatCedis } from '@utils/paystackAmount';

export default function PaymentWebViewScreen({ navigation, route }: PaymentWebViewScreenProps) {
  const { authorizationUrl, orderId, orderNumber, amountPaid, deliveryAddress } = route.params;
  const clearCart = useCartStore((state) => state.clearCart);
  const [isCompleting, setIsCompleting] = useState(false);

  const completePayment = useCallback(() => {
    if (isCompleting) {
      return;
    }

    setIsCompleting(true);
    clearCart();
    navigation.replace('OrderConfirmation', {
      orderId,
      orderNumber,
      amountPaid,
      deliveryAddress,
    });
  }, [amountPaid, clearCart, deliveryAddress, isCompleting, navigation, orderId, orderNumber]);

  const handleNavigationChange = useCallback(
    (event: WebViewNavigation) => {
      if (!isPaymentCallbackUrl(event.url)) {
        return;
      }

      const parsed = parsePaymentCallbackUrl(event.url);
      if (parsed.reference || parsed.orderId) {
        completePayment();
      }
    },
    [completePayment],
  );

  if (isMockCheckoutUrl(authorizationUrl)) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Cancel payment"
          >
            <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Paystack Checkout</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.mockContent}>
          <MaterialIcons name="lock" size={48} color={theme.colors.primary} />
          <Text style={styles.mockTitle}>Secure Payment (Dev Mock)</Text>
          <Text style={styles.mockSubtitle}>
            In production, Paystack&apos;s hosted checkout opens here inside a WebView. Card, Mobile
            Money, and bank transfer details are entered on Paystack — never in CivicBuild.
          </Text>
          <View style={styles.mockSummary}>
            <Text style={styles.mockSummaryLabel}>Order</Text>
            <Text style={styles.mockSummaryValue}>{orderNumber}</Text>
            <Text style={styles.mockSummaryLabel}>Amount</Text>
            <Text style={styles.mockSummaryValue}>{formatCedis(amountPaid)}</Text>
          </View>
          <AuthPrimaryButton
            label="Simulate Successful Payment"
            showArrow={false}
            loading={isCompleting}
            onPress={completePayment}
            disabled={isCompleting}
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
          accessibilityLabel="Cancel payment"
        >
          <MaterialIcons name="close" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Paystack Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <WebView
        source={{ uri: authorizationUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.webLoading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      />
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
  mockContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
  },
  mockTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  mockSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  mockSummary: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
    marginVertical: theme.spacing.md,
  },
  mockSummaryLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  mockSummaryValue: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  loader: {
    marginTop: theme.spacing.sm,
  },
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
