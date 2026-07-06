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

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accountType: AccountType | null;
  onboardingComplete: boolean;
  verificationStatus: VerificationStatus | null;
  deliveryProviderProfile: DeliveryProviderProfile | null;
  deliveryProviderStatus: DeliveryProviderStatus;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
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

      login: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: () => {
        set({ ...initialState });
      },

      updateUser: (partialUser) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...partialUser } });
        }
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
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
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        accountType: state.accountType,
        onboardingComplete: state.onboardingComplete,
        verificationStatus: state.verificationStatus,
        deliveryProviderProfile: state.deliveryProviderProfile,
        deliveryProviderStatus: state.deliveryProviderStatus,
      }),
    },
  ),
);

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectAccessToken = (state: AuthStore) => state.accessToken;
export const selectAccountType = (state: AuthStore) => state.accountType;
export const selectOnboardingComplete = (state: AuthStore) => state.onboardingComplete;
