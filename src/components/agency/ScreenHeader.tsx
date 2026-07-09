import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface ScreenHeaderProps {
  title: string;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export default function ScreenHeader({ title, onBackPress, rightAction }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {onBackPress ? (
        <Pressable
          onPress={onBackPress}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
      ) : (
        <View style={styles.backButton} />
      )}
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.rightSlot}>{rightAction ?? <View style={styles.backButton} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.onSurface,
  },
  rightSlot: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.7,
  },
});
