import type { ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext) => ({
  ...config,
  name: 'CivicBuild',
  slug: 'civicbuild',
  owner: process.env.EXPO_PUBLIC_EXPO_OWNER,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './src/assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#1a1a2e',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.civicbuild.app',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/android-icon-foreground.png',
      backgroundImage: './src/assets/images/android-icon-background.png',
      monochromeImage: './src/assets/images/android-icon-monochrome.png',
      backgroundColor: '#1a1a2e',
    },
    package: 'com.civicbuild.app',
  },
  web: {
    favicon: './src/assets/images/favicon.png',
    bundler: 'metro',
  },
  plugins: ['expo-font', 'expo-secure-store', 'expo-web-browser'],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    eas: {
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID ?? '',
    },
  },
});
