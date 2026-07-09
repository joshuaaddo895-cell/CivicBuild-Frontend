import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import type { HomeStackParamList } from '@appTypes/navigation';
import AgencyDetailScreen from '@screens/main/AgencyDetailScreen';
import AllSuppliersScreen from '@screens/main/AllSuppliersScreen';
import CartScreen from '@screens/main/CartScreen';
import ChangePasswordScreen from '@screens/main/ChangePasswordScreen';
import CheckoutScreen from '@screens/main/CheckoutScreen';
import HomeScreen from '@screens/main/HomeScreen';
import OrderConfirmationScreen from '@screens/main/OrderConfirmationScreen';
import PaymentWebViewScreen from '@screens/main/PaymentWebViewScreen';
import ProductDetailScreen from '@screens/main/ProductDetailScreen';
import ReviewsScreen from '@screens/main/ReviewsScreen';
import SettingsScreen from '@screens/main/SettingsScreen';
import SupplierDetailScreen from '@screens/main/SupplierDetailScreen';
import theme from '@theme/index';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="AllSuppliers" component={AllSuppliersScreen} />
      <Stack.Screen name="SupplierDetail" component={SupplierDetailScreen} />
      <Stack.Screen name="AgencyDetail" component={AgencyDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
