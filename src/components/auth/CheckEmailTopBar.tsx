import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface CheckEmailTopBarProps {
  onClose: () => void;
}

export default function CheckEmailTopBar({ onClose }: CheckEmailTopBarProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <MaterialIcons name="close" size={24} color={theme.colors.primary} />
      </Pressable>
      <Text style={styles.title}>CivicBuild</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.base,
    marginBottom: theme.spacing.stackMd,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
  },
  iconButtonPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
    transform: [{ scale: 0.95 }],
  },
  title: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.primary,
  },
  spacer: {
    width: 40,
  },
});
