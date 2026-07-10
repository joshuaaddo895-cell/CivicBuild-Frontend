import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isPersistableUserId } from '@api/authSession';
import { getOnboarding, type mapBackendOnboarding } from '@api/onboarding';
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

type ServerOnboarding = ReturnType<typeof mapBackendOnboarding>;

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
  managedAgencyId: string | null;
}

interface AuthActions {
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: (options?: { wipeOnboarding?: boolean }) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  restoreSessionFromSecureStorage: () => Promise<void>;
  syncOnboardingFromServer: () => Promise<void>;
  applyServerOnboarding: (onboarding: ServerOnboarding) => void;
  setAccountType: (accountType: AccountType) => void;
  completeOnboarding: () => void;
  setVerificationStatus: (status: VerificationStatus) => void;
  setDeliveryProviderProfile: (profile: DeliveryProviderProfile) => void;
  submitDeliveryProviderSetup: () => void;
  approveDeliveryProvider: () => void;
  rejectDeliveryProvider: () => void;
  setManagedAgencyId: (agencyId: string) => void;
  syncDeliveryProviderApproval: () => void;
  cancelDeliveryProviderRequest: () => void;
}

type AuthStore = AuthState & AuthActions;

const AUTH_PERSIST_VERSION = 6;

function serverOnboardingToState(onboarding: ServerOnboarding) {
  return {
    accountType: onboarding.accountType,
    onboardingComplete: onboarding.onboardingComplete,
    verificationStatus: onboarding.verificationStatus,
    deliveryProviderProfile: onboarding.deliveryProviderProfile,
    deliveryProviderStatus: onboarding.deliveryProviderStatus,
    managedAgencyId: onboarding.managedAgencyId,
  };
}

const emptyOnboardingState: Pick<
  AuthState,
  | 'accountType'
  | 'onboardingComplete'
  | 'verificationStatus'
  | 'deliveryProviderProfile'
  | 'deliveryProviderStatus'
  | 'managedAgencyId'
> = {
  accountType: null,
  onboardingComplete: false,
  verificationStatus: null,
  deliveryProviderProfile: null,
  deliveryProviderStatus: 'none',
  managedAgencyId: null,
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
  ...emptyOnboardingState,
};

function migratePersistedAuth(persisted: unknown) {
  const state = (persisted ?? {}) as Partial<AuthState>;
  return {
    user: state.user ?? null,
    isAuthenticated: Boolean(state.isAuthenticated),
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (user, accessToken, refreshToken) => {
        if (!isPersistableUserId(user.id)) {
          throw new Error('Cannot start a session without a valid user id from the server.');
        }

        await saveStoredTokens(accessToken, refreshToken);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          ...emptyOnboardingState,
        });
        await get().syncOnboardingFromServer();
      },

      logout: async () => {
        await clearStoredTokens();
        set({
          ...initialState,
          hasHydrated: true,
        });
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

      applyServerOnboarding: (onboarding) => {
        set(serverOnboardingToState(onboarding));
      },

      syncOnboardingFromServer: async () => {
        if (!get().isAuthenticated) {
          return;
        }

        const result = await getOnboarding();
        if (result.ok) {
          get().applyServerOnboarding(result.data);
        }
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
          await get().syncOnboardingFromServer();
          return;
        }

        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          ...emptyOnboardingState,
        });
      },

      setAccountType: (accountType) => {
        set({
          ...emptyOnboardingState,
          accountType,
        });
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

      submitDeliveryProviderSetup: () => {
        // Delivery setup is persisted via API in DeliveryProviderSetupScreen.
      },

      approveDeliveryProvider: () => {
        set({
          deliveryProviderStatus: 'approved',
          onboardingComplete: true,
        });
      },

      rejectDeliveryProvider: () => {
        set({ deliveryProviderStatus: 'rejected' });
      },

      setManagedAgencyId: (agencyId) => {
        set({ managedAgencyId: agencyId });
      },

      syncDeliveryProviderApproval: () => {
        void get().syncOnboardingFromServer();
      },

      cancelDeliveryProviderRequest: () => {
        set({
          ...emptyOnboardingState,
          accountType: null,
        });
      },
    }),
    {
      name: 'civicbuild-auth-storage',
      version: AUTH_PERSIST_VERSION,
      migrate: migratePersistedAuth,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => () => {
        (async () => {
          await useAuthStore.getState().restoreSessionFromSecureStorage();
          useAuthStore.getState().setHasHydrated(true);
        })().catch(() => undefined);
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
