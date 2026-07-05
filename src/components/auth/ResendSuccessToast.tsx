import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import theme from '@theme/index';

interface ResendSuccessToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  durationMs?: number;
}

export default function ResendSuccessToast({
  message,
  visible,
  onHide,
  durationMs = 3000,
}: ResendSuccessToastProps) {
  useEffect(() => {
    if (!visible) {
      return;
    }
    const timer = setTimeout(onHide, durationMs);
    return () => clearTimeout(timer);
  }, [visible, onHide, durationMs]);

  if (!visible) {
    return null;
  }

  return (
    <Text style={styles.toast} accessibilityRole="text" accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  toast: {
    alignSelf: 'center',
    marginTop: theme.spacing.stackMd,
    fontFamily: theme.typography.fontFamily.label,
    fontSize: theme.typography.fontSize.labelMd,
    lineHeight: theme.typography.lineHeight.labelMd,
    letterSpacing: theme.typography.letterSpacing.labelMd,
    color: theme.colors.onPrimaryContainer,
    backgroundColor: `${theme.colors.primaryContainer}33`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
});
