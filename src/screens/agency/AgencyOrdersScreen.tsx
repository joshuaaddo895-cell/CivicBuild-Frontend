import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatOrderItemSummary, getAgencyOrders, getOrderStatusLabel } from '@api/agencyOrders';
import type { AgencyOrder } from '@appTypes/agency';
import type { AgencyOrdersScreenProps } from '@appTypes/navigation';
import { EmptyState, ScreenHeader } from '@components/agency';
import theme from '@theme/index';

function formatOrderDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AgencyOrdersScreen({ navigation }: AgencyOrdersScreenProps) {
  const [orders, setOrders] = useState<AgencyOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    const result = await getAgencyOrders();
    if (!result.ok) {
      setLoadError(result.error.message);
      setIsLoading(false);
      return;
    }

    setOrders(result.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Recent Orders" onBackPress={() => navigation.goBack()} />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            onPress={() => void loadOrders()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Retry loading orders"
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {orders.length === 0 ? (
            <EmptyState
              icon="receipt-long"
              title="No customer orders yet"
              message="When customers purchase your materials, their orders will appear here."
            />
          ) : (
            orders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() => navigation.navigate('AgencyOrderDetail', { orderId: order.id })}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`Order from ${order.customerName}`}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.customerName}>{order.customerName}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{getOrderStatusLabel(order.status)}</Text>
                  </View>
                </View>
                <Text style={styles.meta}>
                  {formatOrderDate(order.orderDate)} ·{' '}
                  {formatOrderItemSummary(order.items.length, order.totalAmount)}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.chevron}
                />
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
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
    gap: theme.spacing.sm,
  },
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    position: 'relative',
  },
  pressed: {
    opacity: 0.92,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  customerName: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    textTransform: 'uppercase',
  },
  meta: {
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  chevron: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
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
});
