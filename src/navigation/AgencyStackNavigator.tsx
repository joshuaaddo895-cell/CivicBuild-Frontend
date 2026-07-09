import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { AgencyStackParamList } from '@appTypes/navigation';
import AgencyDashboardScreen from '@screens/agency/AgencyDashboardScreen';
import AgencyOrderDetailScreen from '@screens/agency/AgencyOrderDetailScreen';
import AgencyOrdersScreen from '@screens/agency/AgencyOrdersScreen';
import AgencyPersonnelScreen from '@screens/agency/AgencyPersonnelScreen';
import AgencyPortfolioScreen from '@screens/agency/AgencyPortfolioScreen';
import AgencyPostFormScreen from '@screens/agency/AgencyPostFormScreen';
import AgencyPostsScreen from '@screens/agency/AgencyPostsScreen';
import AgencyProductFormScreen from '@screens/agency/AgencyProductFormScreen';
import AgencyProductsScreen from '@screens/agency/AgencyProductsScreen';
import NotificationsScreen from '@screens/agency/NotificationsScreen';
import ChangePasswordScreen from '@screens/main/ChangePasswordScreen';
import SettingsScreen from '@screens/main/SettingsScreen';
import theme from '@theme/index';

const Stack = createNativeStackNavigator<AgencyStackParamList>();

export default function AgencyStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="AgencyDashboard" component={AgencyDashboardScreen} />
      <Stack.Screen name="AgencyProducts" component={AgencyProductsScreen} />
      <Stack.Screen name="AgencyProductForm" component={AgencyProductFormScreen} />
      <Stack.Screen name="AgencyOrders" component={AgencyOrdersScreen} />
      <Stack.Screen name="AgencyOrderDetail" component={AgencyOrderDetailScreen} />
      <Stack.Screen name="AgencyPosts" component={AgencyPostsScreen} />
      <Stack.Screen name="AgencyPostForm" component={AgencyPostFormScreen} />
      <Stack.Screen name="AgencyPersonnel" component={AgencyPersonnelScreen} />
      <Stack.Screen name="AgencyPortfolio" component={AgencyPortfolioScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
