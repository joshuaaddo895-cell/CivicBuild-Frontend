import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import theme from '@theme/index';

interface CartIconButtonProps {
  itemCount: number;
  onPress?: () => void;
}

export default function CartIconButton({ itemCount, onPress }: CartIconButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (itemCount <= 0) {
      return;
    }

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [itemCount, scale]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
    >
      <MaterialIcons name="shopping-cart" size={24} color={theme.colors.onSurfaceVariant} />
      {itemCount > 0 ? (
        <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
          <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
        </Animated.View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: theme.spacing.xs,
    position: 'relative',
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: 10,
    lineHeight: 12,
    color: theme.colors.onError,
    fontWeight: '700',
  },
});
