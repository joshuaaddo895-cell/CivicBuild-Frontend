import { Image } from 'expo-image';
import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AgencyDashboardScreenProps } from '@appTypes/navigation';
import { DashboardPreviewCard } from '@components/agency';
import { DashboardHeader, ProductGrid, SectionHeader } from '@components/dashboard';
import { findConstructionAgencyById } from '@constants/constructionAgencies';
import { formatOrderItemSummary, getOrdersByAgencyId } from '@constants/mockAgencyOrders';
import { useAgencyPortfolioStore } from '@store/agencyPortfolioStore';
import { useAgencyPostsStore } from '@store/agencyPostsStore';
import { useAuthStore } from '@store/authStore';
import { useDeliveryPersonnelStore } from '@store/deliveryPersonnelStore';
import { useProductStore } from '@store/productStore';
import theme from '@theme/index';
import { getUserInitials } from '@utils/userInitials';

export default function AgencyDashboardScreen({ navigation }: AgencyDashboardScreenProps) {
  const user = useAuthStore((state) => state.user);
  const managedAgencyId = useAuthStore((state) => state.managedAgencyId);
  const agencyId = managedAgencyId ?? 'buildstrong-ltd';

  const initializeProducts = useProductStore((state) => state.initialize);
  const extraProducts = useProductStore((state) => state.extraProducts);
  const removedProductIds = useProductStore((state) => state.removedProductIds);
  const productOverrides = useProductStore((state) => state.productOverrides);
  const getProductsByAgencyId = useProductStore((state) => state.getProductsByAgencyId);
  const agencyProducts = useMemo(
    () => getProductsByAgencyId(agencyId),
    [agencyId, extraProducts, getProductsByAgencyId, productOverrides, removedProductIds],
  );

  const seedPosts = useAgencyPostsStore((state) => state.seedIfNeeded);
  const allPosts = useAgencyPostsStore((state) => state.posts);
  const agencyPosts = useMemo(
    () =>
      allPosts
        .filter((post) => post.agencyId === agencyId)
        .sort(
          (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
        ),
    [agencyId, allPosts],
  );

  const seedPersonnel = useDeliveryPersonnelStore((state) => state.seedIfNeeded);
  const allPersonnel = useDeliveryPersonnelStore((state) => state.personnel);
  const pendingPersonnel = useMemo(
    () =>
      allPersonnel
        .filter(
          (entry) => entry.constructionAgencyId === agencyId && entry.approvalStatus === 'pending',
        )
        .sort(
          (left, right) =>
            new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
        ),
    [agencyId, allPersonnel],
  );
  const approvedPersonnel = useMemo(
    () =>
      allPersonnel
        .filter(
          (entry) => entry.constructionAgencyId === agencyId && entry.approvalStatus === 'approved',
        )
        .sort(
          (left, right) =>
            new Date(right.handledAt ?? right.submittedAt).getTime() -
            new Date(left.handledAt ?? left.submittedAt).getTime(),
        ),
    [agencyId, allPersonnel],
  );

  const allPortfolioImages = useAgencyPortfolioStore((state) => state.imagesByAgencyId);
  const portfolioImages = useMemo(
    () => allPortfolioImages[agencyId] ?? [],
    [agencyId, allPortfolioImages],
  );

  const agency = findConstructionAgencyById(agencyId);
  const orders = useMemo(() => getOrdersByAgencyId(agencyId), [agencyId]);
  const userInitials = getUserInitials(user);
  const userAvatarUri = user?.avatar ?? null;

  useEffect(() => {
    initializeProducts();
    seedPosts();
    seedPersonnel();
  }, [initializeProducts, seedPosts, seedPersonnel]);

  const latestOrder = orders[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DashboardHeader
        userInitials={userInitials}
        userAvatarUri={userAvatarUri}
        onAvatarPress={() => navigation.getParent()?.navigate('Profile', { screen: 'ProfileMain' })}
        onSettingsPress={() => navigation.navigate('Settings')}
        onNotificationsPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.greeting} accessibilityRole="header">
            Agency Dashboard
          </Text>
          <Text style={styles.agencyName}>{agency?.name ?? 'Your Construction Agency'}</Text>
          <Text style={styles.heroSubtitle}>
            Manage products, orders, announcements, and delivery personnel.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Portfolio"
            actionLabel="Manage"
            onActionPress={() => navigation.navigate('AgencyPortfolio')}
          />
          {portfolioImages.length === 0 ? (
            <Pressable
              onPress={() => navigation.navigate('AgencyPortfolio')}
              accessibilityRole="button"
              accessibilityLabel="Add portfolio item"
            >
              <Text style={styles.previewEmpty}>
                No portfolio images yet — tap to add your first project photo.
              </Text>
            </Pressable>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.portfolioRow}
            >
              {portfolioImages.slice(0, 6).map((image) => (
                <Image
                  key={image.imageId}
                  source={{ uri: image.deliveryUrl }}
                  style={styles.portfolioThumb}
                  contentFit="cover"
                  accessibilityLabel="Portfolio image"
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="My Products & Materials"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('AgencyProducts')}
          />
          {agencyProducts.length === 0 ? (
            <Text style={styles.previewEmpty}>You haven&apos;t listed any products yet.</Text>
          ) : (
            <ProductGrid
              products={agencyProducts.slice(0, 4)}
              onProductPress={(productId) =>
                navigation.navigate('AgencyProductForm', { productId })
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Recent Orders"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('AgencyOrders')}
          />
          {latestOrder ? (
            <DashboardPreviewCard
              icon="receipt-long"
              title={latestOrder.customerName}
              subtitle={formatOrderItemSummary(latestOrder.items.length, latestOrder.totalAmount)}
              countLabel={latestOrder.status}
              onPress={() => navigation.navigate('AgencyOrderDetail', { orderId: latestOrder.id })}
            />
          ) : (
            <Text style={styles.previewEmpty}>No customer orders yet.</Text>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Posts & Announcements"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('AgencyPosts')}
          />
          {agencyPosts[0] ? (
            <DashboardPreviewCard
              icon="campaign"
              title={agencyPosts[0].title}
              subtitle={agencyPosts[0].description}
              onPress={() => navigation.navigate('AgencyPosts')}
            />
          ) : (
            <Text style={styles.previewEmpty}>No posts yet — share an update with customers.</Text>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="My Delivery Personnel"
            actionLabel="See All"
            onActionPress={() => navigation.navigate('AgencyPersonnel')}
          />
          <DashboardPreviewCard
            icon="local-shipping"
            title={`${approvedPersonnel.length} approved personnel`}
            subtitle={
              pendingPersonnel.length > 0
                ? `${pendingPersonnel.length} pending approval in Notifications`
                : 'No pending requests'
            }
            countLabel={
              pendingPersonnel.length > 0 ? `${pendingPersonnel.length} pending` : undefined
            }
            onPress={() => navigation.navigate('AgencyPersonnel')}
          />
        </View>
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
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackMd,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.stackMd,
  },
  hero: {
    gap: theme.spacing.xs,
  },
  greeting: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  agencyName: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineMd,
    lineHeight: theme.typography.lineHeight.headlineMd,
    color: theme.colors.onSurface,
  },
  heroSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  section: {
    gap: theme.spacing.stackSm,
  },
  previewEmpty: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
    paddingVertical: theme.spacing.sm,
  },
  portfolioRow: {
    gap: theme.spacing.sm,
  },
  portfolioThumb: {
    width: 120,
    height: 90,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
});
