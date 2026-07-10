import React from 'react';

import { useAuthStore } from '@store/authStore';

import AgencyStackNavigator from './AgencyStackNavigator';
import DeliveryStackNavigator from './DeliveryStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';

/** Routes role-specific home stacks from the Home tab. */
export default function HomeTabNavigator() {
  const accountType = useAuthStore((state) => state.accountType);

  if (accountType === 'construction') {
    return <AgencyStackNavigator />;
  }

  if (accountType === 'delivery') {
    return <DeliveryStackNavigator />;
  }

  return <HomeStackNavigator />;
}
