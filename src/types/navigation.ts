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

import type { VerificationDocumentType } from '@appTypes/verificationDocuments';

// ─── Onboarding Stack ─────────────────────────────────────────────────────────
export type OnboardingStackParamList = {
  RoleSelection: undefined;
  Verification: undefined;
  DeliveryProviderSetup: undefined;
  PendingCompanyConfirmation: undefined;
  VerificationDocumentPreview: {
    documentType: VerificationDocumentType;
  };
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
  ChangePassword: undefined;
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
  ProductDetail: { productId: string };
  Reviews: {
    subjectType: 'product' | 'supplier';
    subjectId: string;
    subjectName: string;
  };
  AllSuppliers: undefined;
  SupplierDetail: { supplierId: string };
  AgencyDetail: { agencyId: string };
  Notifications: undefined;
};

// ─── Agency Stack ─────────────────────────────────────────────────────────────
export type AgencyStackParamList = {
  AgencyDashboard: undefined;
  AgencyProducts: undefined;
  AgencyProductForm: { productId?: string };
  AgencyOrders: undefined;
  AgencyOrderDetail: { orderId: string };
  AgencyPosts: undefined;
  AgencyPostForm: { postId?: string };
  AgencyPersonnel: undefined;
  AgencyPortfolio: undefined;
  Notifications: undefined;
  Settings: undefined;
  ChangePassword: undefined;
};

// ─── Delivery Stack ───────────────────────────────────────────────────────────
export type DeliveryStackParamList = {
  DeliveryDashboard: undefined;
  DeliveryStatus: undefined;
  Notifications: undefined;
  Settings: undefined;
  ChangePassword: undefined;
};

// ─── Messages Stack ─────────────────────────────────────────────────────────────
export type MessagesStackParamList = {
  MessagesList: undefined;
  ConversationDetail: {
    threadId?: string;
    agencyId?: string;
    supplierId?: string;
    participantName?: string;
    participantLogoUri?: string;
    participantLabel?: string;
  };
};

// ─── Main Tab Stack ───────────────────────────────────────────────────────────
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  MyReviews: undefined;
  OrderHistory: undefined;
  CustomerOrderDetail: { orderId: string };
  HelpSupport: undefined;
};

export type MainTabParamList = {
  Home:
    | NavigatorScreenParams<HomeStackParamList>
    | NavigatorScreenParams<AgencyStackParamList>
    | NavigatorScreenParams<DeliveryStackParamList>;
  Saved: undefined;
  Messages: NavigatorScreenParams<MessagesStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
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
export type VerificationDocumentPreviewScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'VerificationDocumentPreview'
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

export type ChangePasswordScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'ChangePassword'>,
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

export type ProductDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'ProductDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type ReviewsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Reviews'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AllSuppliersScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'AllSuppliers'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type SupplierDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'SupplierDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'AgencyDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyDashboardScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'AgencyDashboard'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type DeliveryDashboardScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DeliveryStackParamList, 'DeliveryDashboard'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyProductsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'AgencyProducts'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyProductFormScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'AgencyProductForm'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyOrdersScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'AgencyOrders'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyOrderDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'AgencyOrderDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyPostsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'AgencyPosts'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyPostFormScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'AgencyPostForm'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyPersonnelScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'AgencyPersonnel'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type AgencyPortfolioScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'AgencyPortfolio'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Home'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type NotificationsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AgencyStackParamList, 'Notifications'>,
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
  NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Profile'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type HelpSupportScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'HelpSupport'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Profile'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type EditProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Profile'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type MyReviewsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'MyReviews'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Profile'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type OrderHistoryScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'OrderHistory'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Profile'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type CustomerOrderDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'CustomerOrderDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Profile'>,
    NativeStackScreenProps<RootStackParamList>
  >
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
