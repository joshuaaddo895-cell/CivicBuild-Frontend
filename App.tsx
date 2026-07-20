import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import ErrorBoundary from '@components/ErrorBoundary';
import { useAppFonts } from '@hooks/useAppFonts';
import RootNavigator from '@navigation/RootNavigator';
import SplashScreen from '@screens/SplashScreen';
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
  const [animationDone, setAnimationDone] = useState(false);

  // App is ready to render when fonts are loaded and auth store has rehydrated
  const appReady = fontsLoaded && hasHydrated;
  // Show the full app only once BOTH the splash animation AND app init are done
  const splashDone = animationDone && appReady;

  if (!splashDone) {
    return (
      <View style={styles.fill}>
        <StatusBar style="dark" />
        <SplashScreen onFinish={() => setAnimationDone(true)} />
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
  fill: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
