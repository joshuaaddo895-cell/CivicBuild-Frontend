import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAgency } from '@api/agencies';
import { getSuppliers } from '@api/catalog';
import type { Supplier } from '@appTypes/marketplace';
import type { AllSuppliersScreenProps } from '@appTypes/navigation';
import { DashboardSearchBar } from '@components/dashboard';
import SupplierCard from '@components/dashboard/SupplierCard';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';

const PAGE_SIZE = 20;

export default function AllSuppliersScreen({ navigation }: AllSuppliersScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isSaved = useSavedStore((state) => state.isSaved);

  const fetchSuppliers = useCallback(async (nextPage: number, query: string, append: boolean) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    const result = await getSuppliers({
      q: query.trim() || undefined,
      page: nextPage,
      limit: PAGE_SIZE,
    });

    if (result.ok) {
      setSuppliers((current) => (append ? [...current, ...result.data.items] : result.data.items));
      setTotal(result.data.total);
      setHasNextPage(result.data.hasNextPage);
      setPage(nextPage);
    } else if (!append) {
      setSuppliers([]);
      setError(result.error.message);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      void fetchSuppliers(0, searchQuery, false);
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [fetchSuppliers, searchQuery]);

  const handleSupplierPress = async (supplierId: string) => {
    const agencyResult = await getAgency(supplierId);

    if (agencyResult.ok) {
      navigation.navigate('AgencyDetail', { agencyId: supplierId });
      return;
    }

    navigation.navigate('SupplierDetail', { supplierId });
  };

  const handleLoadMore = () => {
    if (!hasNextPage || isLoadingMore || isLoading) {
      return;
    }

    void fetchSuppliers(page + 1, searchQuery, true);
  };

  const handleScroll = (event: {
    nativeEvent: {
      layoutMeasurement: { height: number };
      contentOffset: { y: number };
      contentSize: { height: number };
    };
  }) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

    if (distanceFromBottom < 120) {
      handleLoadMore();
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
        <Text style={styles.headerTitle}>All Suppliers</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={200}
      >
        <Text style={styles.subtitle}>
          {isLoading
            ? 'Loading suppliers...'
            : `${total} trusted supplier${total === 1 ? '' : 's'} ${
                searchQuery.trim() ? 'found' : 'near Accra'
              }`}
        </Text>

        <DashboardSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search suppliers by name or category..."
        />

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="error-outline" size={40} color={theme.colors.error} />
            <Text style={styles.emptyTitle}>Could not load suppliers</Text>
            <Text style={styles.emptyBody}>{error}</Text>
          </View>
        ) : suppliers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={40} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No suppliers found</Text>
            <Text style={styles.emptyBody}>
              Try a different name or category, such as cement, steel, or roofing.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                layout="list"
                isFavorite={isSaved(supplier.id, 'supplier')}
                onFavoritePress={() => void toggleSaved(supplier.id, 'supplier')}
                onPress={() => void handleSupplierPress(supplier.id)}
              />
            ))}
            {isLoadingMore ? (
              <View style={styles.loadMoreState}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : null}
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
  centeredState: {
    paddingVertical: theme.spacing.stackLg,
    alignItems: 'center',
  },
  list: {
    gap: theme.spacing.md,
  },
  loadMoreState: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
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
});
