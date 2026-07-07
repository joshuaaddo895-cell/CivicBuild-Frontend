import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import ErrorBoundary from '@components/ErrorBoundary';
import { useAppFonts } from '@hooks/useAppFonts';
import RootNavigator from '@navigation/RootNavigator';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

import './global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  const fontsLoaded = useAppFonts();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!fontsLoaded || !hasHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
