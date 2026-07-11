import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { OnboardingStackParamList } from '@appTypes/navigation';
import DeliveryProviderSetupScreen from '@screens/onboarding/DeliveryProviderSetupScreen';
import PendingCompanyConfirmationScreen from '@screens/onboarding/PendingCompanyConfirmationScreen';
import RoleSelectionScreen from '@screens/onboarding/RoleSelectionScreen';
import VerificationDocumentPreviewScreen from '@screens/onboarding/VerificationDocumentPreviewScreen';
import VerificationScreen from '@screens/onboarding/VerificationScreen';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

function getInitialOnboardingRoute(): keyof OnboardingStackParamList {
  const { accountType, deliveryProviderStatus } = useAuthStore.getState();

  if (!accountType) {
    return 'RoleSelection';
  }

  if (accountType === 'delivery') {
    if (
      deliveryProviderStatus === 'pending_company_confirmation' ||
      deliveryProviderStatus === 'rejected'
    ) {
      return 'PendingCompanyConfirmation';
    }
    return 'DeliveryProviderSetup';
  }

  if (accountType === 'construction') {
    return 'Verification';
  }

  return 'RoleSelection';
}

export default function OnboardingNavigator() {
  const accountType = useAuthStore((state) => state.accountType);

  return (
    <Stack.Navigator
      key={accountType ?? 'unset'}
      initialRouteName={getInitialOnboardingRoute()}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="DeliveryProviderSetup" component={DeliveryProviderSetupScreen} />
      <Stack.Screen
        name="PendingCompanyConfirmation"
        component={PendingCompanyConfirmationScreen}
      />
      <Stack.Screen
        name="VerificationDocumentPreview"
        component={VerificationDocumentPreviewScreen}
      />
    </Stack.Navigator>
  );
}
