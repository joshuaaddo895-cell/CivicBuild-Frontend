import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import theme from '@theme/index';

export default function MainTabBarButton({
  children,
  onPress,
  accessibilityState,
  style,
}: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected ?? false;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, style]}
      accessibilityState={accessibilityState}
    >
      <View style={[styles.inner, focused && styles.innerFocused]}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  innerFocused: {
    backgroundColor: theme.colors.primaryContainer,
  },
});

export function getMainTabIcon(
  routeName: string,
  focused: boolean,
): keyof typeof MaterialIcons.glyphMap {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Search':
      return 'search';
    case 'Messages':
      return focused ? 'chat-bubble' : 'chat-bubble-outline';
    case 'Profile':
      return focused ? 'person' : 'person-outline';
    default:
      return 'home';
  }
}
