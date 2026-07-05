import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import theme from '@theme/index';

interface AuthScreenFooterProps extends ViewProps {
  children: React.ReactNode;
}

export default function AuthScreenFooter({ children, style, ...viewProps }: AuthScreenFooterProps) {
  return (
    <View style={[styles.container, style]} {...viewProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.stackLg,
    paddingTop: theme.spacing.stackMd,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    alignItems: 'center',
  },
});
