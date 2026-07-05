import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import type { MainTabParamList } from '@appTypes/navigation';
import MainTabBarButton, { getMainTabIcon } from '@navigation/MainTabBarButton';
import HomeScreen from '@screens/main/HomeScreen';
import MessagesScreen from '@screens/main/MessagesScreen';
import ProfileScreen from '@screens/main/ProfileScreen';
import SearchScreen from '@screens/main/SearchScreen';
import theme from '@theme/index';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarButton: (props) => <MainTabBarButton {...props} />,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 76,
          borderTopLeftRadius: theme.borderRadius.xl,
          borderTopRightRadius: theme.borderRadius.xl,
        },
        tabBarActiveTintColor: theme.colors.onPrimaryContainer,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.label,
          fontSize: theme.typography.fontSize.labelMd,
          letterSpacing: theme.typography.letterSpacing.labelMd,
          textTransform: 'uppercase',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <MaterialIcons
            name={getMainTabIcon(route.name, focused)}
            size={size ?? 24}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
