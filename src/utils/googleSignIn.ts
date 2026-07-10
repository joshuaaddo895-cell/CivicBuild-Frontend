import * as AuthSession from 'expo-auth-session';
import type { AuthRequest, AuthRequestPromptOptions, AuthSessionResult } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useCallback } from 'react';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const AUTH_EXPO_PROXY_BASE_URL = 'https://auth.expo.io';
const APP_SLUG = 'civicbuild';

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

/**
 * Expo project path used by the auth.expo.io proxy (`@owner/slug`).
 * Prefer EXPO_PUBLIC_EXPO_OWNER so redirect URIs stay stable across machines.
 */
export function getExpoProjectFullName(): string {
  const configuredOwner = process.env.EXPO_PUBLIC_EXPO_OWNER?.trim();
  const slug = Constants.expoConfig?.slug ?? APP_SLUG;

  if (configuredOwner) {
    const owner = configuredOwner.startsWith('@') ? configuredOwner.slice(1) : configuredOwner;
    return `@${owner}/${slug}`;
  }

  const originalFullName = Constants.expoConfig?.originalFullName;
  if (originalFullName) {
    return originalFullName;
  }

  return `@anonymous/${slug}`;
}

/** HTTPS redirect URI to register in Google Cloud Console (Web OAuth client). */
export function getGoogleOAuthRedirectUri(): string {
  return `${AUTH_EXPO_PROXY_BASE_URL}/${getExpoProjectFullName()}`;
}

function buildProxyStartUrl(authUrl: string, returnUrl: string): string {
  const projectFullName = getExpoProjectFullName();
  const queryString = new URLSearchParams({ authUrl, returnUrl });
  return `${AUTH_EXPO_PROXY_BASE_URL}/${projectFullName}/start?${queryString.toString()}`;
}

export function isGoogleSignInConfigured(): boolean {
  return Boolean(getGoogleAuthConfig().webClientId);
}

export function useGoogleAuthRequest(): [
  AuthRequest | null,
  AuthSessionResult | null,
  (options?: AuthRequestPromptOptions) => Promise<AuthSessionResult>,
] {
  const webClientId = getGoogleAuthConfig().webClientId ?? '';
  const redirectUri = getGoogleOAuthRedirectUri();

  const [request, result, promptAsyncBase] = Google.useAuthRequest({
    webClientId,
    iosClientId: webClientId,
    androidClientId: webClientId,
    redirectUri,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
  });

  const promptAsync = useCallback(
    async (options?: AuthRequestPromptOptions) => {
      if (!request) {
        throw new Error('Google auth request is not ready yet.');
      }

      const authUrl = request.url ?? (await request.makeAuthUrlAsync(Google.discovery));
      const returnUrl = AuthSession.getDefaultReturnUrl();
      const startUrl = buildProxyStartUrl(authUrl, returnUrl);

      return promptAsyncBase({
        ...options,
        url: startUrl,
      });
    },
    [promptAsyncBase, request],
  );

  return [request, result, promptAsync];
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

/** @internal Dev-only helper to log the redirect URI during setup. */
export function logGoogleOAuthSetupHint(): void {
  if (!__DEV__ || Platform.OS === 'web') {
    return;
  }

  console.warn(
    `[Google OAuth] Register this redirect URI on the Web OAuth client: ${getGoogleOAuthRedirectUri()}`,
  );
}
