import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AgencyDetailScreenProps } from '@appTypes/navigation';
import { AuthPrimaryButton } from '@components/auth';
import { ProductGrid } from '@components/dashboard';
import { getAgencyProfile } from '@constants/agencyProfiles';
import { VERIFIED_CONSTRUCTION_AGENCIES } from '@constants/constructionAgencies';
import { AGENCY_POST_TYPE_LABELS } from '@constants/mockAgencyPosts';
import { useAgencyPostsStore } from '@store/agencyPostsStore';
import { useCartStore } from '@store/cartStore';
import { useProductStore } from '@store/productStore';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';
import { findProductsByAgencyId } from '@utils/productHelpers';

function formatPostDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function AgencyDetailScreen({ navigation, route }: AgencyDetailScreenProps) {
  const { agencyId } = route.params;
  const agency = VERIFIED_CONSTRUCTION_AGENCIES.find((entry) => entry.id === agencyId);
  const profile = getAgencyProfile(agencyId);

  const initializeProducts = useProductStore((state) => state.initialize);
  const products = useProductStore((state) => state.getProductsByAgencyId(agencyId));
  const seedPosts = useAgencyPostsStore((state) => state.seedIfNeeded);
  const posts = useAgencyPostsStore((state) => state.getPostsByAgencyId(agencyId));

  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);
  const addProduct = useCartStore((state) => state.addProduct);

  useEffect(() => {
    initializeProducts();
    seedPosts();
  }, [initializeProducts, seedPosts]);

  const displayProducts = products.length > 0 ? products : findProductsByAgencyId(agencyId);

  if (!agency || !profile) {
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
        <View style={styles.missingState}>
          <Text style={styles.missingText}>Agency not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleMessagePress = () => {
    navigation.getParent()?.navigate('Messages', {
      screen: 'ConversationDetail',
      params: {
        threadId: `thread-${agency.id}`,
        participantName: agency.name,
        participantLogoUri: agency.logoUri,
      },
    });
  };

  const handleAddProduct = (productId: string) => {
    const product = displayProducts.find((entry) => entry.id === productId);
    if (product) {
      addProduct(product);
    }
  };

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
          onPress={() => toggleSaved(agency.id, 'agency')}
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
          <Image
            source={{ uri: agency.logoUri }}
            style={styles.logo}
            contentFit="cover"
            accessibilityLabel={`${agency.name} logo`}
          />
          <View style={styles.heroTextBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{agency.name}</Text>
              {agency.verified ? (
                <MaterialIcons name="verified" size={20} color={theme.colors.primary} />
              ) : null}
            </View>
            <Text style={styles.tagline}>{profile.tagline}</Text>
            <Text style={styles.agencyBadge}>Construction Agency</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.description}>{profile.description}</Text>
          <Text style={styles.infoLine}>
            <MaterialIcons name="location-on" size={16} color={theme.colors.primary} />{' '}
            {profile.address}
          </Text>
          <Text style={styles.infoLine}>
            <MaterialIcons name="phone" size={16} color={theme.colors.primary} /> {profile.phone}
          </Text>
          <Text style={styles.infoLine}>
            <MaterialIcons name="schedule" size={16} color={theme.colors.primary} /> {profile.hours}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Services Offered</Text>
        <View style={styles.servicesWrap}>
          {profile.services.map((service) => (
            <View key={service} style={styles.servicePill}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
        </View>

        {profile.portfolioImageUris.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.portfolioRow}
            >
              {profile.portfolioImageUris.map((uri) => (
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
        {displayProducts.length === 0 ? (
          <Text style={styles.emptyText}>No listed products yet.</Text>
        ) : (
          <ProductGrid
            products={displayProducts}
            isFavorite={(id) => isSaved(id, 'product')}
            onProductPress={(id) => navigation.navigate('ProductDetail', { productId: id })}
            onFavoritePress={(id) => toggleSaved(id, 'product')}
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
        <AuthPrimaryButton label="Message Us" showArrow={false} onPress={handleMessagePress} />
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
