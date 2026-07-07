import { Alert, Platform } from 'react-native';

import { logout as logoutApi } from '@api/auth';
import { useAuthStore } from '@store/authStore';

export async function performSignOut(): Promise<void> {
  const { refreshToken, logout } = useAuthStore.getState();

  if (refreshToken) {
    try {
      await logoutApi(refreshToken);
    } catch {
      // Still clear local session if the server call fails.
    }
  }

  await logout();
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
