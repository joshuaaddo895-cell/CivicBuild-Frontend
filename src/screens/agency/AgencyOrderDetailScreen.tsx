import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAgencyOrder, getOrderStatusLabel, updateAgencyOrderStatus } from '@api/agencyOrders';
import { getThreads } from '@api/messages';
import type { AgencyOrder, OrderStatus } from '@appTypes/agency';
import type { AgencyOrderDetailScreenProps } from '@appTypes/navigation';
import { ScreenHeader } from '@components/agency';
import { AuthPrimaryButton } from '@components/auth';
import theme from '@theme/index';
import { formatCedis, formatUnitSuffix } from '@utils/paystackAmount';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'delivered', 'cancelled'];

export default function AgencyOrderDetailScreen({
  navigation,
  route,
}: AgencyOrderDetailScreenProps) {
  const { orderId } = route.params;

  const [order, setOrder] = useState<AgencyOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [isOpeningMessage, setIsOpeningMessage] = useState(false);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    const result = await getAgencyOrder(orderId);
    if (!result.ok) {
      setLoadError(result.error.message);
      setOrder(null);
      setIsLoading(false);
      return;
    }

    setOrder(result.data);
    setIsLoading(false);
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order || order.status === status) {
      return;
    }

    setStatusError('');
    setIsUpdatingStatus(true);

    const result = await updateAgencyOrderStatus(orderId, status);
    setIsUpdatingStatus(false);

    if (!result.ok) {
      setStatusError(result.error.message);
      return;
    }

    setOrder(result.data);
  };

  const handleMessageCustomer = async () => {
    if (!order || isOpeningMessage) {
      return;
    }

    setIsOpeningMessage(true);

    const result = await getThreads();

    setIsOpeningMessage(false);

    if (!result.ok) {
      Alert.alert('Messages unavailable', result.error.message);
      return;
    }

    const thread = result.data.find((entry) => entry.customerId === order.customerId);

    if (!thread) {
      Alert.alert(
        'No conversation yet',
        'This customer has not started a chat. They can message you from your agency profile.',
      );
      return;
    }

    navigation.getParent()?.navigate('Messages', {
      screen: 'ConversationDetail',
      params: {
        threadId: thread.id,
        participantName: thread.participantName,
        participantLogoUri: thread.participantLogoUri,
        participantLabel: thread.participantLabel,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Order Detail" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (loadError || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Order Detail" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{loadError || 'Order not found.'}</Text>
          <Pressable
            onPress={() => void loadOrder()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Retry loading order"
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Order Detail" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.status}>{getOrderStatusLabel(order.status)}</Text>
          <Text style={styles.total}>{formatCedis(order.totalAmount)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.chipRow}>
            {ORDER_STATUSES.map((status) => (
              <Pressable
                key={status}
                onPress={() => void handleStatusChange(status)}
                disabled={isUpdatingStatus}
                style={({ pressed }) => [
                  styles.chip,
                  order.status === status && styles.chipActive,
                  pressed && !isUpdatingStatus && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Set status to ${getOrderStatusLabel(status)}`}
                accessibilityState={{ selected: order.status === status }}
              >
                <Text style={[styles.chipText, order.status === status && styles.chipTextActive]}>
                  {getOrderStatusLabel(status)}
                </Text>
              </Pressable>
            ))}
          </View>
          {isUpdatingStatus ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : null}
          {statusError ? <Text style={styles.errorText}>{statusError}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item) => {
            const unitSuffix = formatUnitSuffix(item.unit ? `per ${item.unit}` : undefined);
            return (
              <View key={`${item.productId}-${item.quantity}`} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemMeta}>
                    Qty {item.quantity}
                    {unitSuffix ? ` · ${formatCedis(item.unitPrice)} / ${unitSuffix}` : ''}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatCedis(item.unitPrice * item.quantity)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.infoCard}>
            <MaterialIcons name="location-on" size={18} color={theme.colors.primary} />
            <Text style={styles.infoText}>{order.deliveryAddress}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Contact</Text>
          <View style={styles.infoCard}>
            <MaterialIcons name="person" size={18} color={theme.colors.primary} />
            <View>
              <Text style={styles.infoText}>{order.customerName}</Text>
              <Text style={styles.infoSubtext}>{order.customerPhone}</Text>
              <Text style={styles.infoSubtext}>{order.customerEmail}</Text>
            </View>
          </View>
        </View>

        <AuthPrimaryButton
          label="Message Customer"
          loading={isOpeningMessage}
          onPress={() => void handleMessageCustomer()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.stackMd,
  },
  summaryCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: theme.spacing.xs,
  },
  orderNumber: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  customerName: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  status: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  total: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineMd,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryContainer,
  },
  chipText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  itemMeta: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  itemTotal: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  infoText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
  },
  infoSubtext: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
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
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.85,
  },
});
