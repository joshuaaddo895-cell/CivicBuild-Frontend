import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listAgencies } from '@api/agencies';
import { getSuppliers } from '@api/catalog';
import type { MarketplaceListing } from '@appTypes/marketplace';
import type { AllSuppliersScreenProps } from '@appTypes/navigation';
import { DashboardSearchBar } from '@components/dashboard';
import SupplierCard from '@components/dashboard/SupplierCard';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';
import { isAgencyListing, mergeMarketplaceListings } from '@utils/marketplaceDirectory';

const PAGE_SIZE = 20;

function filterListings(listings: MarketplaceListing[], query: string): MarketplaceListing[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return listings;
  }

  return listings.filter(
    (listing) =>
      listing.name.toLowerCase().includes(normalized) ||
      listing.categoryId.toLowerCase().includes(normalized) ||
      listing.tagline?.toLowerCase().includes(normalized),
  );
}

export default function AllSuppliersScreen({ navigation }: AllSuppliersScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);

  const fetchDirectory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [suppliersResult, agenciesResult] = await Promise.all([
      getSuppliers({ page: 0, limit: PAGE_SIZE }),
      listAgencies(undefined, 0, PAGE_SIZE),
    ]);

    if (!suppliersResult.ok && !agenciesResult.ok) {
      setListings([]);
      setError(suppliersResult.error.message || agenciesResult.error.message);
      setIsLoading(false);
      return;
    }

    const suppliers = suppliersResult.ok ? suppliersResult.data.items : [];
    const agencies = agenciesResult.ok ? agenciesResult.data.items : [];

    setListings(mergeMarketplaceListings(suppliers, agencies));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(
      () => {
        void fetchDirectory();
      },
      searchQuery ? 300 : 0,
    );

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [fetchDirectory, searchQuery]);

  const visibleListings = filterListings(listings, searchQuery);

  const handleListingPress = (listing: MarketplaceListing) => {
    if (isAgencyListing(listing)) {
      navigation.navigate('AgencyDetail', { agencyId: listing.id });
      return;
    }

    navigation.navigate('SupplierDetail', { supplierId: listing.id });
  };

  const agencyCount = visibleListings.filter(isAgencyListing).length;
  const supplierCount = visibleListings.length - agencyCount;

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
        <Text style={styles.headerTitle}>Suppliers & Agencies</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          {isLoading
            ? 'Loading directory...'
            : `${visibleListings.length} listing${visibleListings.length === 1 ? '' : 's'} · ${agencyCount} agenc${agencyCount === 1 ? 'y' : 'ies'}, ${supplierCount} supplier${supplierCount === 1 ? '' : 's'}`}
        </Text>

        <View style={styles.hintCard}>
          <MaterialIcons name="info-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.hintText}>
            Construction agencies and material suppliers both support Message Us chat once you open
            their profile.
          </Text>
        </View>

        <DashboardSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or category..."
        />

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="error-outline" size={40} color={theme.colors.error} />
            <Text style={styles.emptyTitle}>Could not load directory</Text>
            <Text style={styles.emptyBody}>{error}</Text>
            <Pressable
              onPress={() => void fetchDirectory()}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : visibleListings.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={40} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptyBody}>
              Try a different search, or pull to refresh after the backend seed finishes.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {visibleListings.map((listing) => (
              <SupplierCard
                key={`${listing.listingKind}-${listing.id}`}
                supplier={listing}
                layout="list"
                isFavorite={
                  isAgencyListing(listing)
                    ? isSaved(listing.id, 'agency')
                    : isSaved(listing.id, 'supplier')
                }
                onFavoritePress={() =>
                  void toggleSaved(listing.id, isAgencyListing(listing) ? 'agency' : 'supplier')
                }
                onPress={() => handleListingPress(listing)}
              />
            ))}
          </View>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  headerSpacer: {
    width: 32,
  },
  pressed: {
    opacity: 0.75,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.stackLg,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryContainer,
  },
  hintText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onPrimaryContainer,
  },
  centeredState: {
    paddingVertical: theme.spacing.stackLg,
    alignItems: 'center',
  },
  list: {
    gap: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.stackLg,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  emptyBody: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryContainer,
  },
  retryText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onPrimaryContainer,
    fontWeight: '600',
  },
});
