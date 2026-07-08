import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Supplier } from '@appTypes/marketplace';
import theme from '@theme/index';

interface SupplierCardProps {
  supplier: Supplier;
  layout?: 'carousel' | 'list';
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
}

export default function SupplierCard({
  supplier,
  layout = 'carousel',
  isFavorite = false,
  onPress,
  onFavoritePress,
}: SupplierCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        layout === 'list' && styles.cardList,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${supplier.name}, rated ${supplier.rating}, ${supplier.distanceKm} kilometers away`}
    >
      <View style={styles.logoWrapper}>
        <Image
          source={{ uri: supplier.logoUri }}
          style={styles.logo}
          contentFit="cover"
          accessibilityLabel={`${supplier.name} logo`}
        />
        {onFavoritePress ? (
          <Pressable
            onPress={onFavoritePress}
            style={({ pressed }) => [
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
              pressed && styles.favoritePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Save ${supplier.name} to favorites`}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={16}
              color={isFavorite ? theme.colors.error : '#FFFFFF'}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {supplier.name}
          </Text>
          {supplier.verified ? (
            <MaterialIcons name="verified" size={16} color={theme.colors.primary} />
          ) : null}
        </View>
        <View style={styles.ratingRow}>
          <MaterialIcons name="star" size={14} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.rating}>
            {supplier.rating.toFixed(1)} ({supplier.reviewCount} reviews)
          </Text>
        </View>
        <Text style={styles.distance}>{supplier.distanceKm.toFixed(1)} km away</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 256,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardList: {
    width: '100%',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  logoWrapper: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerHigh,
    overflow: 'hidden',
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  favoriteButtonActive: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderColor: theme.colors.outlineVariant,
  },
  favoritePressed: {
    transform: [{ scale: 0.95 }],
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurface,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.onSurfaceVariant,
  },
  distance: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    color: theme.colors.onSecondaryContainer,
    marginTop: 2,
  },
});
