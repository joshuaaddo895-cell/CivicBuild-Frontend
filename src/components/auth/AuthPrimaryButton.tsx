import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from 'react-native';

import theme from '@theme/index';

interface AuthPrimaryButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  loading?: boolean;
  showArrow?: boolean;
}

export default function AuthPrimaryButton({
  label,
  loading = false,
  showArrow = true,
  disabled,
  style,
  ...pressableProps
}: AuthPrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onPrimary} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, isDisabled && styles.labelDisabled]}>{label}</Text>
          {showArrow && !isDisabled ? (
            <MaterialIcons name="arrow-forward" size={22} color={theme.colors.onPrimary} />
          ) : showArrow ? (
            <MaterialIcons name="arrow-forward" size={22} color={theme.colors.onSurfaceVariant} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    opacity: 0.7,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
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
});
