import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import theme from '@theme/index';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  errorMessage?: string;
  hasError?: boolean;
}

export default function PasswordInput({
  label,
  errorMessage,
  hasError,
  style,
  accessibilityLabel,
  ...textInputProps
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const showError = hasError || Boolean(errorMessage);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, showError && styles.inputWrapperError]}>
        <MaterialIcons
          name="lock-outline"
          size={20}
          color={theme.colors.onSurfaceVariant}
          style={styles.leadingIcon}
        />
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.outline}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityRole="text"
          {...textInputProps}
        />
        <Pressable
          onPress={() => setVisible((prev) => !prev)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        >
          <MaterialIcons
            name={visible ? 'visibility-off' : 'visibility'}
            size={22}
            color={theme.colors.onSurfaceVariant}
          />
        </Pressable>
      </View>
      {errorMessage ? (
        <View style={styles.errorRow} accessibilityRole="alert">
          <MaterialIcons name="error-outline" size={14} color={theme.colors.error} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    paddingHorizontal: theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingHorizontal: theme.spacing.md,
  },
  inputWrapperError: {
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  leadingIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodyMd,
    lineHeight: theme.typography.lineHeight.bodyMd,
    color: theme.colors.onSurface,
    paddingVertical: 0,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.xs,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: 11,
    color: theme.colors.error,
  },
});
