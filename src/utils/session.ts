import { Alert, Platform } from 'react-native';

import { authApi } from '@services/endpoints';
import { useAuthStore } from '@store/authStore';
import { isMockAccessToken } from '@utils/mockAuth';

async function clearSession() {
  useAuthStore.getState().logout();
}

export async function performSignOut(): Promise<void> {
  const { accessToken } = useAuthStore.getState();

  if (accessToken && !isMockAccessToken(accessToken)) {
    try {
      await authApi.logout();
    } catch {
      // Still clear local session if the server call fails.
    }
  }

  await clearSession();
}

export function confirmSignOut(onConfirm: () => void | Promise<void>) {
  const title = 'Sign Out';
  const message = 'Are you sure you want to sign out?';

  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      Promise.resolve(onConfirm()).catch(() => undefined);
    }
    return;
  }

  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Sign Out',
      style: 'destructive',
      onPress: () => {
        Promise.resolve(onConfirm()).catch(() => undefined);
      },
    },
  ]);
}
