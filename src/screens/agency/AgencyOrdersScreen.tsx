import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AgencyOrdersScreenProps } from '@appTypes/navigation';
import { EmptyState, ScreenHeader } from '@components/agency';
import {
  formatOrderItemSummary,
  getOrderStatusLabel,
  getOrdersByAgencyId,
} from '@constants/mockAgencyOrders';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

function formatOrderDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AgencyOrdersScreen({ navigation }: AgencyOrdersScreenProps) {
  const managedAgencyId = useAuthStore((state) => state.managedAgencyId);
  const agencyId = managedAgencyId ?? 'buildstrong-ltd';
  const orders = useMemo(() => getOrdersByAgencyId(agencyId), [agencyId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Recent Orders" onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
});
