import React from 'react';

import { useAuthStore } from '@store/authStore';

import AgencyStackNavigator from './AgencyStackNavigator';
import HomeStackNavigator from './HomeStackNavigator';

/** Routes construction agencies to their dashboard; all other roles use the customer marketplace home. */
export default function HomeTabNavigator() {
  const accountType = useAuthStore((state) => state.accountType);

  if (accountType === 'construction') {
    return <AgencyStackNavigator />;
  }

  return <HomeStackNavigator />;
}
