import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import theme from '@theme/index';

import GoogleLogo from './GoogleLogo';

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function GoogleSignInButton({
  onPress,
  disabled = false,
  loading = false,
}: GoogleSignInButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onSurface} />
      ) : (
        <>
          <GoogleLogo size={20} />
          <Text style={styles.label}>Continue with Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    backgroundColor: theme.colors.surfaceContainerLow,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurface,
  },
});
