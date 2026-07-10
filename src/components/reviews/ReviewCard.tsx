import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatReviewDate } from '@api/reviews';
import type { Review } from '@appTypes/reviewsApi';
import theme from '@theme/index';

interface ReviewCardProps {
  review: Review;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={styles.starRow}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < Math.round(rating);
        return (
          <MaterialIcons
            key={index}
            name={filled ? 'star' : 'star-border'}
            size={14}
            color={filled ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        );
      })}
    </View>
  );
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.reviewerName}>{review.reviewerName}</Text>
          <StarRow rating={review.rating} />
        </View>
        <Text style={styles.date}>{formatReviewDate(review.date)}</Text>
      </View>

      {review.verifiedPurchase ? (
        <View style={styles.verifiedTag}>
          <MaterialIcons name="verified" size={12} color={theme.colors.primary} />
          <Text style={styles.verifiedText}>Verified Purchase</Text>
        </View>
      ) : null}

      <Text style={styles.reviewText}>{review.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  reviewerName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  date: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
  verifiedTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primaryContainer}44`,
  },
  verifiedText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  reviewText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
});
