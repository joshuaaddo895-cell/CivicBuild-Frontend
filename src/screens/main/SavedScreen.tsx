import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { SavedScreenProps } from '@appTypes/navigation';
import type { SavedItemDetail } from '@appTypes/saved';
import { CategoryChipList, ScrollToTopButton } from '@components/dashboard';
import { MARKETPLACE_CATEGORIES } from '@constants/marketplaceData';
import { useSavedStore } from '@store/savedStore';
import theme from '@theme/index';
import { resolveSavedItemDetailAsync } from '@utils/roleLabels';

export default function SavedScreen(_props: SavedScreenProps) {
  const listRef = useRef<FlatList<SavedItemDetail>>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [resolvedDetails, setResolvedDetails] = useState<SavedItemDetail[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  const items = useSavedStore((state) => state.items);
  const isLoading = useSavedStore((state) => state.isLoading);
  const error = useSavedStore((state) => state.error);
  const syncFromServer = useSavedStore((state) => state.syncFromServer);

  useEffect(() => {
    void syncFromServer();
  }, [syncFromServer]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()),
    [items],
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsResolving(true);

      const details = await Promise.all(
        sortedItems.map((item) => resolveSavedItemDetailAsync(item)),
      );

      if (!cancelled) {
        setResolvedDetails(details.filter((item): item is SavedItemDetail => item !== null));
        setIsResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sortedItems]);

  const filteredDetails = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return resolvedDetails;
    }

    return resolvedDetails.filter((item) => {
      if (item.type !== 'product') {
        return false;
      }

      return item.subtitle.toLowerCase() === selectedCategoryId.toLowerCase();
    });
  }, [resolvedDetails, selectedCategoryId]);

  const showLoading = isLoading || isResolving;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle} accessibilityRole="header">
        Saved
      </Text>

      <CategoryChipList
        categories={MARKETPLACE_CATEGORIES}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      {showLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text style={styles.emptyTitle}>Could not load saved items</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      ) : filteredDetails.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="favorite-border" size={48} color={theme.colors.outline} />
          <Text style={styles.emptyTitle}>
            {selectedCategoryId === 'all'
              ? "You haven't saved anything yet"
              : 'No saved items in this category'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {selectedCategoryId === 'all'
              ? 'Browse the marketplace and tap the heart icon on materials or suppliers to save them here.'
              : 'Try another category or browse the marketplace to save materials.'}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={filteredDetails}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.listContent}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            setShowScrollTop(event.nativeEvent.contentOffset.y > 300);
          }}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Open saved ${item.title}`}
            >
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.cardImage}
                  contentFit="cover"
                  accessibilityLabel={`${item.title} image`}
                />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                  <MaterialIcons
                    name="inventory-2"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
                {item.priceLabel ? <Text style={styles.cardPrice}>{item.priceLabel}</Text> : null}
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          )}
        />
      )}
      <ScrollToTopButton
        visible={showScrollTop && filteredDetails.length > 0}
        onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
        bottomOffset={24}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackMd,
    position: 'relative',
  },
  screenTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineLgMobile,
    lineHeight: theme.typography.lineHeight.headlineLgMobile,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.stackMd,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyLg,
    color: theme.colors.onSurface,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.bodyMd,
  },
  listContent: {
    paddingTop: theme.spacing.stackMd,
    paddingBottom: theme.spacing.stackLg,
    gap: theme.spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    marginBottom: theme.spacing.sm,
  },
  cardPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  cardImage: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
  },
  cardImagePlaceholder: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardType: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    letterSpacing: theme.typography.letterSpacing.labelMd,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  cardPrice: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});
