import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { OnboardingStackParamList } from '@appTypes/navigation';
import RoleSelectionScreen from '@screens/onboarding/RoleSelectionScreen';
import VerificationScreen from '@screens/onboarding/VerificationScreen';
import theme from '@theme/index';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="RoleSelection"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
    </Stack.Navigator>
  );
}
