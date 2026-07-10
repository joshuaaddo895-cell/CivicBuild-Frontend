import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAgency, getAgencyPortfolio, getAgencyPosts, type BackendAgency } from '@api/agencies';
import { startThread } from '@api/messages';
import type { AgencyPost } from '@appTypes/agency';
import type { AgencyDetailScreenProps } from '@appTypes/navigation';
import { AuthPrimaryButton } from '@components/auth';
import { ProductGrid } from '@components/dashboard';
import { AGENCY_POST_TYPE_LABELS } from '@constants/agencyPostLabels';
import { useCartStore } from '@store/cartStore';
import { useProductStore } from '@store/productStore';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';
import { mapBackendAgencyPost } from '@utils/agencyPostMappers';

function formatPostDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AgencyDetailScreen({ navigation, route }: AgencyDetailScreenProps) {
  const { agencyId } = route.params;

  const [agency, setAgency] = useState<BackendAgency | null>(null);
  const [posts, setPosts] = useState<AgencyPost[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingThread, setIsStartingThread] = useState(false);

  const fetchCatalog = useProductStore((state) => state.fetchCatalog);
  const catalogProducts = useProductStore((state) => state.catalogProducts);
  const products = useMemo(
    () => catalogProducts.filter((product) => product.agencyId === agencyId),
    [agencyId, catalogProducts],
  );
  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);
  const addProduct = useCartStore((state) => state.addProduct);

  const loadAgency = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [agencyResult, postsResult, portfolioResult] = await Promise.all([
      getAgency(agencyId),
      getAgencyPosts(agencyId),
      getAgencyPortfolio(agencyId),
    ]);

    if (!agencyResult.ok) {
      setAgency(null);
      setError(agencyResult.error.message);
      setIsLoading(false);
      return;
    }

    setAgency(agencyResult.data);
    setPosts(postsResult.ok ? postsResult.data.map(mapBackendAgencyPost) : []);
    setPortfolioUrls(
      portfolioResult.ok ? portfolioResult.data.map((image) => image.deliveryUrl) : [],
    );
    setIsLoading(false);
  }, [agencyId]);

  useEffect(() => {
    void fetchCatalog();
    void loadAgency();
  }, [fetchCatalog, loadAgency]);

  const handleMessagePress = async () => {
    if (!agency || isStartingThread) {
      return;
    }

    setIsStartingThread(true);

    const result = await startThread({ agencyId: agency.id });

    setIsStartingThread(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    navigation.getParent()?.navigate('Messages', {
      screen: 'ConversationDetail',
      params: {
        threadId: result.data.id,
        participantName: result.data.participantName,
        participantLogoUri: result.data.participantLogoUri,
      },
    });
  };

  const handleAddProduct = (productId: string) => {
    const product = products.find((entry) => entry.id === productId);
    if (product) {
      addProduct(product);
    }
  };

  if (isLoading) {
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
          <Text style={styles.headerTitle}>Agency</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!agency) {
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
          <Text style={styles.headerTitle}>Agency</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centeredState}>
          <Text style={styles.missingText}>{error ?? 'Agency not found.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const logoUri = agency.logoUrl ?? '';

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {agency.name}
        </Text>
        <Pressable
          onPress={() => void toggleSaved(agency.id, 'agency')}
          style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={
            isSaved(agency.id, 'agency') ? 'Remove from favorites' : 'Save to favorites'
          }
        >
          <MaterialIcons
            name={isSaved(agency.id, 'agency') ? 'favorite' : 'favorite-border'}
            size={24}
            color={
              isSaved(agency.id, 'agency') ? theme.colors.error : theme.colors.onSurfaceVariant
            }
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          {logoUri ? (
            <Image
              source={{ uri: logoUri }}
              style={styles.logo}
              contentFit="cover"
              accessibilityLabel={`${agency.name} logo`}
            />
          ) : (
            <View style={[styles.logo, styles.logoPlaceholder]}>
              <MaterialIcons name="business" size={32} color={theme.colors.onSurfaceVariant} />
            </View>
          )}
          <View style={styles.heroTextBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{agency.name}</Text>
              {agency.verified ? (
                <MaterialIcons name="verified" size={20} color={theme.colors.primary} />
              ) : null}
            </View>
            {agency.tagline ? <Text style={styles.tagline}>{agency.tagline}</Text> : null}
            <Text style={styles.agencyBadge}>{agency.category || 'Construction Agency'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          {agency.description ? (
            <Text style={styles.description}>{agency.description}</Text>
          ) : (
            <Text style={styles.emptyText}>No description available yet.</Text>
          )}
          {agency.address ? (
            <Text style={styles.infoLine}>
              <MaterialIcons name="location-on" size={16} color={theme.colors.primary} />{' '}
              {agency.address}
            </Text>
          ) : null}
          {agency.phone ? (
            <Text style={styles.infoLine}>
              <MaterialIcons name="phone" size={16} color={theme.colors.primary} /> {agency.phone}
            </Text>
          ) : null}
          {agency.hours ? (
            <Text style={styles.infoLine}>
              <MaterialIcons name="schedule" size={16} color={theme.colors.primary} />{' '}
              {agency.hours}
            </Text>
          ) : null}
        </View>

        {agency.services && agency.services.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Services Offered</Text>
            <View style={styles.servicesWrap}>
              {agency.services.map((service) => (
                <View key={service} style={styles.servicePill}>
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {portfolioUrls.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.portfolioRow}
            >
              {portfolioUrls.map((uri) => (
                <Image
                  key={uri}
                  source={{ uri }}
                  style={styles.portfolioImage}
                  contentFit="cover"
                  accessibilityLabel="Agency portfolio image"
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Materials & Products</Text>
        {products.length === 0 ? (
          <Text style={styles.emptyText}>No listed products yet.</Text>
        ) : (
          <ProductGrid
            products={products}
            isFavorite={(id) => isSaved(id, 'product')}
            onProductPress={(id) => navigation.navigate('ProductDetail', { productId: id })}
            onFavoritePress={(id) => void toggleSaved(id, 'product')}
            onAddPress={handleAddProduct}
          />
        )}

        <Text style={styles.sectionTitle}>Recent Updates</Text>
        {posts.length === 0 ? (
          <Text style={styles.emptyText}>No updates posted yet.</Text>
        ) : (
          posts.slice(0, 5).map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Text style={styles.postType}>{AGENCY_POST_TYPE_LABELS[post.type]}</Text>
                <Text style={styles.postDate}>{formatPostDate(post.createdAt)}</Text>
              </View>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postBody}>{post.description}</Text>
              {post.imageUri ? (
                <Image
                  source={{ uri: post.imageUri }}
                  style={styles.postImage}
                  contentFit="cover"
                  accessibilityLabel={`Image for ${post.title}`}
                />
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AuthPrimaryButton
          label="Message Us"
          showArrow={false}
          loading={isStartingThread}
          onPress={() => void handleMessagePress()}
        />
      </View>
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
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  favoriteButton: {
    padding: theme.spacing.xs,
    width: 40,
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  headerSpacer: {
    width: 40,
  },
  pressed: {
    opacity: 0.75,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  missingText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.stackMd,
  },
  heroCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceContainer,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextBlock: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  name: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  tagline: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  agencyBadge: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: theme.spacing.sm,
  },
  description: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurface,
  },
  infoLine: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  servicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  servicePill: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  serviceText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onPrimaryContainer,
  },
  portfolioRow: {
    marginHorizontal: -theme.spacing.marginMobile,
    paddingHorizontal: theme.spacing.marginMobile,
  },
  portfolioImage: {
    width: 160,
    height: 110,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceContainer,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  postCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: theme.spacing.xs,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postType: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  postDate: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  postTitle: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  postBody: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
    lineHeight: theme.typography.lineHeight.bodySm,
  },
  postImage: {
    width: '100%',
    height: 160,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xs,
  },
  footer: {
    padding: theme.spacing.marginMobile,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
});
