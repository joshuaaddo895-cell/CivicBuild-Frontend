import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

import CivicBuildLogo from './CivicBuildLogo';

interface AuthScreenTopBarProps {
  onClose: () => void;
}

export default function AuthScreenTopBar({ onClose }: AuthScreenTopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <CivicBuildLogo size="sm" showWordmark={false} layout="inline" />
        <Text style={styles.wordmark}>CivicBuild</Text>
      </View>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <MaterialIcons name="close" size={24} color={theme.colors.onSurfaceVariant} />
      </Pressable>
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
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  wordmark: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.primary,
  },
  closeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  closeButtonPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
    transform: [{ scale: 0.95 }],
  },
});
