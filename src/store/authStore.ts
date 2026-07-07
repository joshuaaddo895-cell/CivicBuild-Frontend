import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { User } from '@appTypes/api';
import type {
  AccountType,
  DeliveryProviderProfile,
  DeliveryProviderStatus,
  VerificationStatus,
} from '@appTypes/onboarding';
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveStoredTokens,
} from '@utils/tokenStorage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  accountType: AccountType | null;
  onboardingComplete: boolean;
  verificationStatus: VerificationStatus | null;
  deliveryProviderProfile: DeliveryProviderProfile | null;
  deliveryProviderStatus: DeliveryProviderStatus;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  restoreSessionFromSecureStorage: () => Promise<void>;
  setAccountType: (accountType: AccountType) => void;
  completeOnboarding: () => void;
  setVerificationStatus: (status: VerificationStatus) => void;
  setDeliveryProviderProfile: (profile: DeliveryProviderProfile) => void;
  submitDeliveryProviderSetup: (profile: DeliveryProviderProfile) => void;
  approveDeliveryProvider: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
  accountType: null,
  onboardingComplete: false,
  verificationStatus: null,
  deliveryProviderProfile: null,
  deliveryProviderStatus: 'none',
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (user, accessToken, refreshToken) => {
        await saveStoredTokens(accessToken, refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: async () => {
        await clearStoredTokens();
        set({ ...initialState, hasHydrated: true });
      },

      updateUser: (partialUser) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...partialUser } });
        }
      },

      setTokens: async (accessToken, refreshToken) => {
        await saveStoredTokens(accessToken, refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },

      restoreSessionFromSecureStorage: async () => {
        const [accessToken, refreshToken] = await Promise.all([
          getStoredAccessToken(),
          getStoredRefreshToken(),
        ]);

        if (accessToken && refreshToken) {
          set({
            accessToken,
            refreshToken,
            isAuthenticated: true,
          });
          return;
        }

        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setAccountType: (accountType) => {
        set({ accountType });
      },

      completeOnboarding: () => {
        set({ onboardingComplete: true });
      },

      setVerificationStatus: (status) => {
        set({ verificationStatus: status });
      },

      setDeliveryProviderProfile: (profile) => {
        set({ deliveryProviderProfile: profile });
      },

      submitDeliveryProviderSetup: (profile) => {
        set({
          deliveryProviderProfile: profile,
          deliveryProviderStatus: 'pending_company_confirmation',
        });
      },

      approveDeliveryProvider: () => {
        set({
          deliveryProviderStatus: 'approved',
          onboardingComplete: true,
        });
      },
    }),
    {
      name: 'civicbuild-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accountType: state.accountType,
        onboardingComplete: state.onboardingComplete,
        verificationStatus: state.verificationStatus,
        deliveryProviderProfile: state.deliveryProviderProfile,
        deliveryProviderStatus: state.deliveryProviderStatus,
      }),
      onRehydrateStorage: () => () => {
        void (async () => {
          await useAuthStore.getState().restoreSessionFromSecureStorage();
          useAuthStore.getState().setHasHydrated(true);
        })();
      },
    },
  ),
);

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectAccessToken = (state: AuthStore) => state.accessToken;
export const selectAccountType = (state: AuthStore) => state.accountType;
export const selectOnboardingComplete = (state: AuthStore) => state.onboardingComplete;
export const selectHasHydrated = (state: AuthStore) => state.hasHydrated;
