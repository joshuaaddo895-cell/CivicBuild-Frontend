import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getReviewSummary, getReviews } from '@api/reviews';
import type { ReviewsScreenProps } from '@appTypes/navigation';
import type { Review, ReviewSummary } from '@appTypes/reviewsApi';
import RatingBreakdownChart from '@components/reviews/RatingBreakdownChart';
import ReviewCard from '@components/reviews/ReviewCard';
import WriteReviewForm from '@components/reviews/WriteReviewForm';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

function HeaderStars({ rating }: { rating: number }) {
  return (
    <View style={styles.headerStars}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < Math.round(rating);
        return (
          <MaterialIcons
            key={index}
            name={filled ? 'star' : 'star-border'}
            size={22}
            color={filled ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        );
      })}
    </View>
  );
}

export default function ReviewsScreen({ navigation, route }: ReviewsScreenProps) {
  const { subjectType, subjectId, subjectName } = route.params;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [summaryResult, reviewsResult] = await Promise.all([
      getReviewSummary(subjectType, subjectId),
      getReviews(subjectType, subjectId),
    ]);

    if (!summaryResult.ok) {
      setSummary(null);
      setReviews([]);
      setError(summaryResult.error.message);
      setIsLoading(false);
      return;
    }

    setSummary(summaryResult.data);
    setReviews(reviewsResult.ok ? reviewsResult.data : []);
    if (!reviewsResult.ok) {
      setError(reviewsResult.error.message);
    }

    setIsLoading(false);
  }, [subjectId, subjectType]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

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
          Reviews
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && !summary ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : summary ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subjectName}>{subjectName}</Text>

          {isAuthenticated ? (
            <WriteReviewForm
              subjectType={subjectType}
              subjectId={subjectId}
              subjectName={subjectName}
              onSubmitted={() => void loadReviews()}
            />
          ) : null}

          <View style={styles.summaryCard}>
            <Text style={styles.averageRating}>{summary.averageRating.toFixed(1)}</Text>
            <HeaderStars rating={summary.averageRating} />
            <Text style={styles.reviewCount}>
              {summary.totalCount} review{summary.totalCount === 1 ? '' : 's'}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Rating breakdown</Text>
          <View style={styles.breakdownCard}>
            <RatingBreakdownChart breakdown={summary.breakdown} />
          </View>

          <Text style={styles.sectionTitle}>Customer reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>No reviews yet.</Text>
          ) : (
            <View style={styles.reviewList}>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          )}
        </ScrollView>
      ) : null}
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
    opacity: 0.7,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.error,
    textAlign: 'center',
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.stackLg,
  },
  subjectName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  summaryCard: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  averageRating: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: 48,
    lineHeight: 52,
    color: theme.colors.onSurface,
  },
  headerStars: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewCount: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  breakdownCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.lg,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  reviewList: {
    gap: theme.spacing.md,
  },
});
