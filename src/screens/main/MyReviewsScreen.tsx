import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { MyReviewsScreenProps } from '@appTypes/navigation';
import MyReviewCard from '@components/reviews/MyReviewCard';
import {
  getMyReviewsSummary,
  MOCK_USER_REVIEWS,
  type MyReviewType,
} from '@constants/mockMyReviews';
import theme from '@theme/index';

type FilterKey = 'all' | MyReviewType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'product', label: 'Products' },
  { key: 'supplier', label: 'Suppliers' },
];

function SummaryStars({ rating }: { rating: number }) {
  return (
    <View style={styles.summaryStars}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < Math.round(rating);
        return (
          <MaterialIcons
            key={index}
            name={filled ? 'star' : 'star-border'}
            size={16}
            color={filled ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        );
      })}
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function MyReviewsScreen({ navigation }: MyReviewsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const summary = useMemo(() => getMyReviewsSummary(MOCK_USER_REVIEWS), []);

  const filteredReviews = useMemo(() => {
    if (activeFilter === 'all') {
      return summary.reviews;
    }
    return summary.reviews.filter((review) => review.type === activeFilter);
  }, [activeFilter, summary.reviews]);

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
        <Text style={styles.headerTitle}>My Reviews / Ratings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <MaterialIcons name="rate-review" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>Your feedback</Text>
              <Text style={styles.heroSubtitle}>
                Reviews you have left on products and suppliers after orders on CivicBuild.
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatTile label="Reviews" value={String(summary.totalCount)} />
            <View style={styles.statDivider} />
            <StatTile label="Products" value={String(summary.productCount)} />
            <View style={styles.statDivider} />
            <StatTile label="Suppliers" value={String(summary.supplierCount)} />
          </View>

          <View style={styles.avgRow}>
            <Text style={styles.avgLabel}>Average rating given</Text>
            <View style={styles.avgValueRow}>
              <Text style={styles.avgValue}>{summary.averageRatingGiven.toFixed(1)}</Text>
              <SummaryStars rating={summary.averageRatingGiven} />
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <Pressable
                key={filter.key}
                onPress={() => setActiveFilter(filter.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Filter ${filter.label}`}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {filteredReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="star-outline" size={40} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptyBody}>
              After you complete an order, you can leave a review from the product or supplier page.
            </Text>
          </View>
        ) : (
          <View style={styles.reviewList}>
            {filteredReviews.map((review) => (
              <MyReviewCard key={review.id} review={review} />
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
  heroCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  heroTop: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextBlock: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  heroSubtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.onSurface,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.labelMd,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.colors.outlineVariant,
  },
  avgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainer,
  },
  avgLabel: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  avgValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avgValue: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    color: theme.colors.primary,
  },
  summaryStars: {
    flexDirection: 'row',
    gap: 2,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.labelMd,
  },
  filterChipTextActive: {
    color: theme.colors.onPrimary,
  },
  reviewList: {
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
});
