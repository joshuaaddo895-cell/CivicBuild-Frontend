import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import theme from '@theme/index';

interface ScrollToTopButtonProps {
  visible: boolean;
  onPress: () => void;
  bottomOffset?: number;
}

export default function ScrollToTopButton({
  visible,
  onPress,
  bottomOffset = 24,
}: ScrollToTopButtonProps) {
  if (!visible) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { bottom: bottomOffset }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Scroll to top"
    >
      <MaterialIcons name="keyboard-arrow-up" size={28} color={theme.colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: theme.spacing.marginMobile,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
    zIndex: 10,
  },
  pressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  },
});
