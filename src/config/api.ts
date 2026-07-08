import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = '8081';

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function getConfiguredApiUrl(): string | undefined {
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();
  return value ? normalizeBaseUrl(value) : undefined;
}

/**
 * Platform-specific dev overrides when no explicit env URL should be used
 * (simulators/emulators). Physical devices always use EXPO_PUBLIC_API_URL
 * (typically the dev machine's LAN IP).
 */
function getDevPlatformOverride(): string | null {
  if (!__DEV__) {
    return null;
  }

  if (Platform.OS === 'android' && !Constants.isDevice) {
    return `http://10.0.2.2:${DEFAULT_API_PORT}`;
  }

  if (Platform.OS === 'ios' && !Constants.isDevice) {
    return `http://localhost:${DEFAULT_API_PORT}`;
  }

  return null;
}

export function getApiBaseUrl(): string {
  const configuredUrl = getConfiguredApiUrl();
  if (configuredUrl) {
    return configuredUrl;
  }

  const platformOverride = getDevPlatformOverride();
  if (platformOverride) {
    return platformOverride;
  }

  throw new Error(
    'EXPO_PUBLIC_API_URL is not configured. Set it in .env.development (use your LAN IP for physical devices).',
  );
}

export function getApiTimeoutMs(): number {
  const parsed = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10_000;
}
