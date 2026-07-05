import React from 'react';
import { StyleSheet, Text } from 'react-native';

import theme from '@theme/index';

interface AuthTermsNoticeProps {
  onTermsPress?: () => void;
}

export default function AuthTermsNotice({ onTermsPress }: AuthTermsNoticeProps) {
  return (
    <Text style={styles.text}>
      By signing up, you agree to our{' '}
      <Text
        style={styles.link}
        onPress={onTermsPress}
        accessibilityRole="link"
        accessibilityLabel="Terms of Service"
      >
        Terms of Service
      </Text>
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.bodySm,
    lineHeight: theme.typography.lineHeight.bodySm,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingTop: theme.spacing.sm,
  },
  link: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bodySemi,
  },
});
