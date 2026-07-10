import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatReviewDate } from '@api/reviews';
import type { UserWrittenReview } from '@appTypes/reviewsApi';
import theme from '@theme/index';

interface MyReviewCardProps {
  review: UserWrittenReview;
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

export default function MyReviewCard({ review }: MyReviewCardProps) {
  const typeLabel = review.type === 'product' ? 'Product' : 'Supplier';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image
          source={{ uri: review.subjectImageUri }}
          style={styles.thumbnail}
          contentFit="cover"
          accessibilityLabel={`${review.subjectName} image`}
        />

        <View style={styles.subjectInfo}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeLabel}</Text>
            </View>
            {review.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{review.category}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.subjectName} numberOfLines={2}>
            {review.subjectName}
          </Text>

          {review.supplierName ? (
            <Text style={styles.supplierName} numberOfLines={1}>
              via {review.supplierName}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.metaRow}>
        <StarRow rating={review.rating} />
        <Text style={styles.date}>{formatReviewDate(review.date)}</Text>
      </View>

      <Text style={styles.reviewText}>{review.text}</Text>

      {review.orderNumber ? (
        <View style={styles.orderRow}>
          <MaterialIcons name="receipt-long" size={14} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.orderText}>Order {review.orderNumber}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainer,
  },
  subjectInfo: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary}18`,
  },
  typeBadgeText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.labelMd,
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceContainer,
  },
  categoryBadgeText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  subjectName: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  supplierName: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  reviewText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainer,
  },
  orderText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
});
