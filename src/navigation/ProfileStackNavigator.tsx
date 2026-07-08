import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { ProfileStackParamList } from '@appTypes/navigation';
import EditProfileScreen from '@screens/main/EditProfileScreen';
import HelpSupportScreen from '@screens/main/HelpSupportScreen';
import ProfileScreen from '@screens/main/ProfileScreen';
import theme from '@theme/index';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
}
