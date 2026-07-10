import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getAgencyPersonnel,
  getMyAgency,
  getMyAgencyPosts,
  getMyPortfolio,
  type BackendAgency,
  type BackendPersonnel,
  type BackendPortfolioImage,
} from '@api/agencies';
import { formatOrderItemSummary, getAgencyOrders, getOrderStatusLabel } from '@api/agencyOrders';
import { getProducts } from '@api/catalog';
import type { AgencyOrder, AgencyPost } from '@appTypes/agency';
import type { Product } from '@appTypes/marketplace';
import type { AgencyDashboardScreenProps } from '@appTypes/navigation';
import { DashboardPreviewCard } from '@components/agency';
import { DashboardHeader, ProductGrid, SectionHeader } from '@components/dashboard';
import { useAuthStore } from '@store/authStore';
import { useProductStore } from '@store/productStore';
import theme from '@theme/index';
import { mapBackendAgencyPost } from '@utils/agencyPostMappers';
import { getUserInitials } from '@utils/userInitials';

export default function AgencyDashboardScreen({ navigation }: AgencyDashboardScreenProps) {
  const user = useAuthStore((state) => state.user);
  const syncOnboardingFromServer = useAuthStore((state) => state.syncOnboardingFromServer);

  const fetchCatalog = useProductStore((state) => state.fetchCatalog);
  const getProductsByAgencyId = useProductStore((state) => state.getProductsByAgencyId);

  const [agency, setAgency] = useState<BackendAgency | null>(null);
  const [agencyProducts, setAgencyProducts] = useState<Product[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<BackendPortfolioImage[]>([]);
  const [agencyPosts, setAgencyPosts] = useState<AgencyPost[]>([]);
  const [orders, setOrders] = useState<AgencyOrder[]>([]);
  const [personnel, setPersonnel] = useState<BackendPersonnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      await syncOnboardingFromServer();
      void fetchCatalog();

      const [agencyResult, postsResult, portfolioResult, ordersResult, personnelResult] =
        await Promise.all([
          getMyAgency(),
          getMyAgencyPosts(),
          getMyPortfolio(),
          getAgencyOrders(),
          getAgencyPersonnel(),
        ]);

      if (!agencyResult.ok) {
        setAgency(null);
        setAgencyProducts([]);
        setLoadError(
          agencyResult.error.statusCode === 404
            ? 'No agency is linked to your account yet. Complete agency verification or log out and sign in again.'
            : agencyResult.error.message,
        );
        return;
      }

      setAgency(agencyResult.data);

      const productsResult = await getProducts({ agencyId: agencyResult.data.id, limit: 50 });
      if (productsResult.ok) {
        setAgencyProducts(productsResult.data.items);
      } else {
        setAgencyProducts(getProductsByAgencyId(agencyResult.data.id));
      }

      setAgencyPosts(
        postsResult.ok
          ? postsResult.data
              .map(mapBackendAgencyPost)
              .sort(
                (left, right) =>
                  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
              )
          : [],
      );
      setPortfolioImages(portfolioResult.ok ? portfolioResult.data : []);
      setOrders(ordersResult.ok ? ordersResult.data : []);
      setPersonnel(personnelResult.ok ? personnelResult.data : []);
      setLoadError('');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load dashboard.');
      setAgency(null);
      setAgencyProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCatalog, getProductsByAgencyId, syncOnboardingFromServer]);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const userInitials = getUserInitials(user);
  const userAvatarUri = user?.avatar ?? null;
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

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable
            onPress={() => void loadDashboard()}
            style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Retry loading dashboard"
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                countLabel={getOrderStatusLabel(latestOrder.status)}
                onPress={() =>
                  navigation.navigate('AgencyOrderDetail', { orderId: latestOrder.id })
                }
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
              <Text style={styles.previewEmpty}>
                No posts yet — share an update with customers.
              </Text>
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
              title={`${personnel.length} delivery personnel`}
              subtitle={
                personnel.length > 0
                  ? 'Linked delivery providers for your agency'
                  : 'No delivery personnel linked yet'
              }
              onPress={() => navigation.navigate('AgencyPersonnel')}
            />
          </View>
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
  pressed: {
    opacity: 0.85,
  },
});
