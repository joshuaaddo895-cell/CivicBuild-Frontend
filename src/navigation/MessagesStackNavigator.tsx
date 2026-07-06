import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { MessagesStackParamList } from '@appTypes/navigation';
import ConversationDetailScreen from '@screens/main/ConversationDetailScreen';
import MessagesScreen from '@screens/main/MessagesScreen';
import theme from '@theme/index';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="MessagesList" component={MessagesScreen} />
      <Stack.Screen name="ConversationDetail" component={ConversationDetailScreen} />
    </Stack.Navigator>
  );
}
