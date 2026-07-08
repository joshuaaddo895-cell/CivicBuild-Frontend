import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import type { PaymentWebViewScreenProps } from '@appTypes/navigation';
import { AuthPrimaryButton } from '@components/auth';
import { verifyOrderPayment } from '@services/checkoutService';
import { useCartStore } from '@store/cartStore';
import theme from '@theme/index';
import {
  isMockCheckoutUrl,
  isPaymentCallbackUrl,
  parsePaymentCallbackUrl,
} from '@utils/mockCheckout';
import { formatCedis } from '@utils/paystackAmount';
import { isValidPaymentUrl } from '@utils/userInitials';

export default function PaymentWebViewScreen({ navigation, route }: PaymentWebViewScreenProps) {
  const { authorizationUrl, orderId, orderNumber, amountPaid, deliveryAddress } = route.params;
  const clearCart = useCartStore((state) => state.clearCart);
  const [isCompleting, setIsCompleting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const finishOrder = useCallback(() => {
    clearCart();
    navigation.replace('OrderConfirmation', {
      orderId,
      orderNumber,
      amountPaid,
      deliveryAddress,
    });
  }, [amountPaid, clearCart, deliveryAddress, navigation, orderId, orderNumber]);

  const confirmPaymentWithBackend = useCallback(async () => {
    if (isCompleting) {
      return;
    }

    setIsCompleting(true);
    setVerifyError(null);

    if (isMockCheckoutUrl(authorizationUrl)) {
      finishOrder();
      return;
    }

    try {
      const order = await verifyOrderPayment(orderId);

      if (order.status !== 'PAID') {
        setVerifyError('Payment is still processing. Tap retry in a moment.');
        setIsCompleting(false);
        return;
      }

      finishOrder();
    } catch {
      setVerifyError(
        'Payment received but verification is pending. Tap retry or check your orders.',
      );
      setIsCompleting(false);
    }
  }, [authorizationUrl, finishOrder, isCompleting, orderId]);

  const handleNavigationChange = useCallback(
    (event: WebViewNavigation) => {
      if (!isPaymentCallbackUrl(event.url)) {
        return;
      }

      const parsed = parsePaymentCallbackUrl(event.url);
      if (
        parsed.reference ||
        parsed.orderId ||
        event.url.includes('/api/payments/paystack/callback')
      ) {
        void confirmPaymentWithBackend();
      }
    },
    [confirmPaymentWithBackend],
  );

  if (!isValidPaymentUrl(authorizationUrl)) {
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
          <Text style={styles.headerTitle}>Payment Error</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.mockContent}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text style={styles.mockTitle}>Unable to load payment page</Text>
          <Text style={styles.mockSubtitle}>Please try again from checkout.</Text>
          <AuthPrimaryButton
            label="Go Back"
            showArrow={false}
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

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
            onPress={() => void confirmPaymentWithBackend()}
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

      {verifyError ? (
        <View style={styles.verifyErrorBar}>
          <Text style={styles.verifyErrorText}>{verifyError}</Text>
          <AuthPrimaryButton
            label="Retry Verification"
            showArrow={false}
            loading={isCompleting}
            onPress={() => void confirmPaymentWithBackend()}
            disabled={isCompleting}
          />
        </View>
      ) : null}
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
  verifyErrorBar: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  verifyErrorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
    textAlign: 'center',
  },
});
