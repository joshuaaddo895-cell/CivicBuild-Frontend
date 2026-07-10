import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';

import type { MainTabParamList } from '@appTypes/navigation';
import HomeTabNavigator from '@navigation/HomeTabNavigator';
import MainTabBarButton, { getMainTabIcon } from '@navigation/MainTabBarButton';
import MessagesStackNavigator from '@navigation/MessagesStackNavigator';
import ProfileStackNavigator from '@navigation/ProfileStackNavigator';
import SavedScreen from '@screens/main/SavedScreen';
import { useAuthStore } from '@store/authStore';
import theme from '@theme/index';

const Tab = createBottomTabNavigator<MainTabParamList>();

function CreatePostTabPlaceholder() {
  return <View />;
}

export default function MainNavigator() {
  const accountType = useAuthStore((state) => state.accountType);
  const isConstructionAgency = accountType === 'construction';

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
            name={getMainTabIcon(route.name, focused, accountType)}
            size={size ?? 24}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeTabNavigator} options={{ title: 'Home' }} />
      <Tab.Screen
        name="Saved"
        component={isConstructionAgency ? CreatePostTabPlaceholder : SavedScreen}
        options={{
          title: isConstructionAgency ? 'Create' : 'Saved',
          tabBarAccessibilityLabel: isConstructionAgency ? 'Create post' : 'Saved items',
        }}
        listeners={
          isConstructionAgency
            ? ({ navigation }) => ({
                tabPress: (event) => {
                  event.preventDefault();
                  navigation.navigate('Home', {
                    screen: 'AgencyPostForm',
                    params: {},
                  });
                },
              })
            : undefined
        }
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStackNavigator}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
