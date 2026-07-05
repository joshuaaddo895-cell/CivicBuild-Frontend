import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '@appTypes/marketplace';
import theme from '@theme/index';

interface ProductCardProps {
  product: Product;
  onQuotePress?: () => void;
  onFavoritePress?: () => void;
}

export default function ProductCard({ product, onQuotePress, onFavoritePress }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.imageUri }}
          style={styles.image}
          contentFit="cover"
          accessibilityLabel={product.imageAlt}
          transition={200}
        />
        <Pressable
          onPress={onFavoritePress}
          style={({ pressed }) => [styles.favoriteButton, pressed && styles.favoritePressed]}
          accessibilityRole="button"
          accessibilityLabel={`Save ${product.name} to favorites`}
        >
          <MaterialIcons name="favorite-border" size={18} color={theme.colors.secondary} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{product.priceLabel}</Text>
          <Pressable
            onPress={onQuotePress}
            style={({ pressed }) => [styles.quoteButton, pressed && styles.quotePressed]}
            accessibilityRole="button"
            accessibilityLabel={`Request quote for ${product.name}`}
          >
            <MaterialIcons name="add" size={20} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  imageWrapper: {
    height: 128,
    backgroundColor: theme.colors.surfaceContainer,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(249, 249, 249, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoritePressed: {
    transform: [{ scale: 0.9 }],
  },
  body: {
    padding: theme.spacing.md,
  },
  category: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  name: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurface,
    fontWeight: '700',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  price: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.primary,
  },
  quoteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quotePressed: {
    transform: [{ scale: 0.9 }],
  },
});
