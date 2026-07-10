import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { createReview } from '@api/reviews';
import type { ReviewSubjectType } from '@appTypes/reviewsApi';
import { AuthPrimaryButton } from '@components/auth';
import theme from '@theme/index';

interface WriteReviewFormProps {
  subjectType: ReviewSubjectType;
  subjectId: string;
  subjectName: string;
  orderNumber?: string;
  verifiedPurchase?: boolean;
  onSubmitted?: () => void;
}

export default function WriteReviewForm({
  subjectType,
  subjectId,
  subjectName,
  orderNumber,
  verifiedPurchase = false,
  onSubmitted,
}: WriteReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!text.trim()) {
      setError('Please write a short review before submitting.');
      return;
    }

    setIsSubmitting(true);

    const result = await createReview({
      subjectType,
      subjectId,
      rating,
      text: text.trim(),
      verifiedPurchase,
      orderNumber,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setText('');
    setRating(5);
    setSuccessMessage('Thanks — your review was posted.');
    onSubmitted?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Write a review</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        Share your experience with {subjectName}
      </Text>

      <View style={styles.starsRow}>
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const filled = starValue <= rating;
          return (
            <Pressable
              key={starValue}
              onPress={() => setRating(starValue)}
              style={({ pressed }) => [styles.starButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${starValue} stars`}
            >
              <MaterialIcons
                name={filled ? 'star' : 'star-border'}
                size={32}
                color={filled ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="What did you like or dislike?"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        multiline
        style={styles.input}
        textAlignVertical="top"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <AuthPrimaryButton
        label="Post review"
        showArrow={false}
        loading={isSubmitting}
        onPress={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  title: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.onSurfaceVariant,
  },
  starsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginVertical: theme.spacing.xs,
  },
  starButton: {
    padding: theme.spacing.xs,
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surface,
  },
  error: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.error,
  },
  success: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    color: theme.colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});
