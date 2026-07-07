import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export interface GoogleSignInResult {
  idToken: string;
}

export function getGoogleAuthConfig() {
  return {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  };
}

export function isGoogleSignInConfigured(): boolean {
  const config = getGoogleAuthConfig();
  return Boolean(config.webClientId || config.iosClientId || config.androidClientId);
}

export function useGoogleAuthRequest() {
  const config = getGoogleAuthConfig();

  return Google.useAuthRequest({
    webClientId: config.webClientId,
    iosClientId: config.iosClientId,
    androidClientId: config.androidClientId,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
  });
}

export function extractGoogleIdToken(
  result: Awaited<ReturnType<ReturnType<typeof useGoogleAuthRequest>[2]>>,
): string | null {
  if (result.type !== 'success') {
    return null;
  }

  return (
    result.authentication?.idToken ??
    (typeof result.params?.id_token === 'string' ? result.params.id_token : null)
  );
}
