import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface VerificationSubmitButtonProps {
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  onPress: () => void;
}

export default function VerificationSubmitButton({
  loading = false,
  disabled = false,
  label = 'Continue',
  onPress,
}: VerificationSubmitButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.colors.onPrimary} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
          <MaterialIcons
            name="arrow-forward"
            size={22}
            color={isDisabled ? theme.colors.onSurfaceVariant : theme.colors.onPrimary}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    opacity: 0.85,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  label: {
    fontFamily: theme.typography.fontFamily.headline,
    fontSize: theme.typography.fontSize.headlineSm,
    lineHeight: theme.typography.lineHeight.headlineSm,
    color: theme.colors.onPrimary,
  },
  labelDisabled: {
    color: theme.colors.onSurfaceVariant,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    color: theme.colors.onPrimary,
  },
});
