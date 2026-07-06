import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeNavigationProp,
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

// ─── Onboarding Stack ─────────────────────────────────────────────────────────
export type OnboardingStackParamList = {
  RoleSelection: undefined;
  Verification: undefined;
  DeliveryProviderSetup: undefined;
  PendingCompanyConfirmation: undefined;
};

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Verify: { email: string; mode?: 'reset' | 'signup' };
};

// ─── Home Stack ───────────────────────────────────────────────────────────────
export type HomeStackParamList = {
  HomeMain: undefined;
  Settings: undefined;
  Cart: undefined;
  Checkout: undefined;
  PaymentWebView: {
    authorizationUrl: string;
    orderId: string;
    orderNumber: string;
    reference: string;
    amountPaid: number;
    deliveryAddress: string;
  };
  OrderConfirmation: {
    orderId: string;
    orderNumber: string;
    amountPaid: number;
    deliveryAddress: string;
  };
};

// ─── Messages Stack ─────────────────────────────────────────────────────────────
export type MessagesStackParamList = {
  MessagesList: undefined;
  ConversationDetail: { threadId: string };
};

// ─── Main Tab Stack ───────────────────────────────────────────────────────────
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Saved: undefined;
  Messages: NavigatorScreenParams<MessagesStackParamList>;
  Profile: undefined;
};

// ─── Root Stack ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// ─── Typed Screen Props ───────────────────────────────────────────────────────
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;
export type VerifyScreenProps = NativeStackScreenProps<AuthStackParamList, 'Verify'>;

export type RoleSelectionScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'RoleSelection'
>;
export type VerificationScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'Verification'
>;
export type DeliveryProviderSetupScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'DeliveryProviderSetup'
>;
export type PendingCompanyConfirmationScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'PendingCompanyConfirmation'
>;

export type HomeMainScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeMain'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type SettingsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Settings'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type CartScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Cart'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type CheckoutScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Checkout'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type PaymentWebViewScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'PaymentWebView'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type OrderConfirmationScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'OrderConfirmation'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type SavedScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Saved'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type MessagesListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MessagesStackParamList, 'MessagesList'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Messages'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type ConversationDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MessagesStackParamList, 'ConversationDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Messages'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

// ─── Typed Navigation Props ───────────────────────────────────────────────────
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type HomeStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Home'>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;
export type MessagesStackNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MessagesStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Messages'>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;
export type MainTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
