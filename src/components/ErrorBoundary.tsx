import React, { Component, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import theme from '@theme/index';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // In production, send to crash reporting (e.g. Sentry)
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.legacy.colors.surface.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.legacy.spacing['2xl'],
    gap: theme.legacy.spacing.lg,
  },
  icon: { fontSize: 64 },
  title: {
    fontSize: theme.legacy.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.legacy.colors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.legacy.typography.fontSize.base,
    color: theme.legacy.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: theme.legacy.colors.primary[600],
    paddingVertical: theme.legacy.spacing.md,
    paddingHorizontal: theme.legacy.spacing['2xl'],
    borderRadius: theme.legacy.borderRadius.xl,
    marginTop: theme.legacy.spacing.md,
  },
  buttonText: {
    color: theme.legacy.colors.white,
    fontSize: theme.legacy.typography.fontSize.base,
    fontWeight: theme.legacy.typography.fontWeight.semibold,
  },
});

export default ErrorBoundary;
