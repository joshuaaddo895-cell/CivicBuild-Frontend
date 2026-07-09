import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AgencyOrderDetailScreenProps } from '@appTypes/navigation';
import { ScreenHeader } from '@components/agency';
import { AuthPrimaryButton } from '@components/auth';
import { getOrderById, getOrderStatusLabel } from '@constants/mockAgencyOrders';
import theme from '@theme/index';
import { formatCedis, formatUnitSuffix } from '@utils/paystackAmount';

export default function AgencyOrderDetailScreen({
  navigation,
  route,
}: AgencyOrderDetailScreenProps) {
  const order = useMemo(() => getOrderById(route.params.orderId), [route.params.orderId]);

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScreenHeader title="Order Detail" onBackPress={() => navigation.goBack()} />
        <View style={styles.missingState}>
          <Text style={styles.missingText}>Order not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleMessageCustomer = () => {
    navigation.getParent()?.navigate('Messages', {
      screen: 'ConversationDetail',
      params: {
        threadId: `thread-customer-${order.customerId}`,
        participantName: order.customerName,
      },
    });
  };

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

        <AuthPrimaryButton label="Message Customer" onPress={handleMessageCustomer} />
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
    gap: theme.spacing.stackMd,
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
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
});
