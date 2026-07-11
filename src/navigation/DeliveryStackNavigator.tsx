import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { DeliveryStackParamList } from '@appTypes/navigation';
import NotificationsScreen from '@screens/agency/NotificationsScreen';
import DeliveryDashboardScreen from '@screens/delivery/DeliveryDashboardScreen';
import ChangePasswordScreen from '@screens/main/ChangePasswordScreen';
import SettingsScreen from '@screens/main/SettingsScreen';
import theme from '@theme/index';

const Stack = createNativeStackNavigator<DeliveryStackParamList>();

export default function DeliveryStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboardScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
