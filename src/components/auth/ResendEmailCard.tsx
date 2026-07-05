import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import theme from '@theme/index';

interface ResendEmailCardProps {
  prompt: string;
  label: string;
  loading: boolean;
  errorMessage?: string;
  onResend: () => void;
}

export default function ResendEmailCard({
  prompt,
  label,
  loading,
  errorMessage,
  onResend,
}: ResendEmailCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      <Pressable
        onPress={onResend}
        disabled={loading}
        style={({ pressed }) => [
          styles.button,
          loading && styles.buttonDisabled,
          pressed && !loading && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: loading, busy: loading }}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.buttonText}>Sending...</Text>
          </>
        ) : (
          <>
            <Text style={styles.buttonText}>{label}</Text>
            <MaterialIcons name="forward-to-inbox" size={18} color={theme.colors.primary} />
          </>
        )}
      </Pressable>
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.stackSm,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  prompt: {
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: theme.spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },
  buttonText: {
    fontFamily: theme.typography.fontFamily.bodySemi,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  error: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.error,
    textAlign: 'center',
  },
});
