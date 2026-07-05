import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { RootStackParamList } from '@appTypes/navigation';
import { useAuthStore } from '@store/authStore';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  const showAuth = !isAuthenticated;
  const showOnboarding = isAuthenticated && !onboardingComplete;
  const showMain = isAuthenticated && onboardingComplete;

  return (
    <Stack.Navigator
      key={showAuth ? 'auth' : showOnboarding ? 'onboarding' : 'main'}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      {showAuth ? <Stack.Screen name="Auth" component={AuthNavigator} /> : null}
      {showOnboarding ? <Stack.Screen name="Onboarding" component={OnboardingNavigator} /> : null}
      {showMain ? <Stack.Screen name="Main" component={MainNavigator} /> : null}
    </Stack.Navigator>
  );
}
