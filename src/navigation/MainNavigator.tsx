import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import type { MainTabParamList } from '@appTypes/navigation';
import { useUnreadInboxSync } from '@hooks/useUnreadInboxSync';
import HomeTabNavigator from '@navigation/HomeTabNavigator';
import MainTabBarButton, { getMainTabIcon } from '@navigation/MainTabBarButton';
import MessagesStackNavigator from '@navigation/MessagesStackNavigator';
import ProfileStackNavigator from '@navigation/ProfileStackNavigator';
import DeliveryStatusScreen from '@screens/delivery/DeliveryStatusScreen';
import SavedScreen from '@screens/main/SavedScreen';
import { useAuthStore } from '@store/authStore';
import { useInboxStore } from '@store/inboxStore';
import theme from '@theme/index';

const Tab = createBottomTabNavigator<MainTabParamList>();

function CreatePostTabPlaceholder() {
  return <View />;
}

export default function MainNavigator() {
  const accountType = useAuthStore((state) => state.accountType);
  const isConstructionAgency = accountType === 'construction';
  const unreadMessageCount = useInboxStore((state) => state.unreadMessageCount);
  const refreshUnreadCounts = useInboxStore((state) => state.refreshUnreadCounts);

  useUnreadInboxSync();

  useEffect(() => {
    void refreshUnreadCounts();
  }, [refreshUnreadCounts]);

  const messagesTabBadge =
    unreadMessageCount > 0 ? (unreadMessageCount > 99 ? '99+' : unreadMessageCount) : undefined;

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
        component={
          accountType === 'delivery'
            ? DeliveryStatusScreen
            : isConstructionAgency
              ? CreatePostTabPlaceholder
              : SavedScreen
        }
        options={{
          title: accountType === 'delivery' ? 'Status' : isConstructionAgency ? 'Create' : 'Saved',
          tabBarAccessibilityLabel:
            accountType === 'delivery'
              ? 'Delivery status'
              : isConstructionAgency
                ? 'Create post'
                : 'Saved items',
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
        options={{ title: 'Messages', tabBarBadge: messagesTabBadge }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Messages', { screen: 'MessagesList' });
          },
        })}
      />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
