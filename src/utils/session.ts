import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

import { deleteAccount } from '@api/account';
import { logout as logoutApi } from '@api/auth';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { useSavedStore } from '@store/savedStore';

const ACCOUNT_DELETED_TOAST_KEY = 'civicbuild_account_deleted_toast';
const REGISTER_SUCCESS_TOAST_KEY = 'civicbuild_register_success_toast';
const CHANGE_PASSWORD_SUCCESS_TOAST_KEY = 'civicbuild_change_password_success_toast';

export async function setRegisterSuccessToastFlag(): Promise<void> {
  await AsyncStorage.setItem(REGISTER_SUCCESS_TOAST_KEY, '1');
}

export async function consumeRegisterSuccessToastFlag(): Promise<boolean> {
  const value = await AsyncStorage.getItem(REGISTER_SUCCESS_TOAST_KEY);
  if (!value) {
    return false;
  }

  await AsyncStorage.removeItem(REGISTER_SUCCESS_TOAST_KEY);
  return true;
}

export async function setChangePasswordSuccessToastFlag(): Promise<void> {
  await AsyncStorage.setItem(CHANGE_PASSWORD_SUCCESS_TOAST_KEY, '1');
}

export async function consumeChangePasswordSuccessToastFlag(): Promise<boolean> {
  const value = await AsyncStorage.getItem(CHANGE_PASSWORD_SUCCESS_TOAST_KEY);
  if (!value) {
    return false;
  }

  await AsyncStorage.removeItem(CHANGE_PASSWORD_SUCCESS_TOAST_KEY);
  return true;
}

export async function setAccountDeletedToastFlag(): Promise<void> {
  await AsyncStorage.setItem(ACCOUNT_DELETED_TOAST_KEY, '1');
}

export async function consumeAccountDeletedToastFlag(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ACCOUNT_DELETED_TOAST_KEY);
  if (!value) {
    return false;
  }

  await AsyncStorage.removeItem(ACCOUNT_DELETED_TOAST_KEY);
  return true;
}

export async function purgeLocalSession(): Promise<void> {
  useCartStore.getState().clearCart();
  useSavedStore.setState({ items: [], hasSynced: false });

  await Promise.all([
    useAuthStore.getState().logout({ wipeOnboarding: true }),
    useAuthStore.persist.clearStorage(),
  ]);
}

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

export type DeleteAccountOutcome =
  { ok: true } | { ok: false; message: string; sessionCleared?: boolean };

export async function performDeleteAccount(): Promise<DeleteAccountOutcome> {
  const result = await deleteAccount();

  if (!result.ok) {
    if (result.error.code === 'UNAUTHORIZED') {
      await purgeLocalSession();
      return {
        ok: false,
        message: 'Your session expired. Please sign in again.',
        sessionCleared: true,
      };
    }

    return { ok: false, message: result.error.message };
  }

  await purgeLocalSession();
  await setAccountDeletedToastFlag();
  return { ok: true };
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
