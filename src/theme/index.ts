// CivicBuild design tokens — sourced from PROMPT.md (Google Stitch export)

// ─── Brand & semantic colors ─────────────────────────────────────────────────
export const colors = {
  primary: '#006e1c',
  primaryContainer: '#4caf50',
  primaryFixedDim: '#78dc77',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#003c0b',
  onPrimaryFixedVariant: '#005313',

  secondary: '#546067',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#5a666d',
  secondaryContainer: '#d7e4ec',
  secondaryFixed: '#d7e4ec',

  tertiary: '#785900',
  tertiaryContainer: '#c49400',
  tertiaryFixed: '#ffdf9e',
  tertiaryFixedDim: '#fabd00',
  onTertiary: '#ffffff',
  onTertiaryFixed: '#261a00',
  onTertiaryContainer: '#433000',

  background: '#f9f9f9',
  surface: '#f9f9f9',
  surfaceBright: '#f9f9f9',
  surfaceDim: '#dadada',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f3f3',
  surfaceContainer: '#eeeeee',
  surfaceContainerHigh: '#e8e8e8',
  surfaceContainerHighest: '#e2e2e2',
  surfaceVariant: '#e2e2e2',

  onBackground: '#1a1c1c',
  onSurface: '#1a1c1c',
  onSurfaceVariant: '#3f4a3c',

  outline: '#6f7a6b',
  outlineVariant: '#becab9',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  inversePrimary: '#78dc77',
  inverseSurface: '#2f3131',
  inverseOnSurface: '#f1f1f1',

  surfaceTint: '#006e1c',
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  base: 8,
  gutter: 16,
  stackSm: 12,
  stackMd: 24,
  stackLg: 48,
  marginMobile: 20,
  marginDesktop: 40,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ─── Border radius ─────────────────────────────────────────────────────────────
export const borderRadius = {
  sm: 4,
  DEFAULT: 4,
  md: 8,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
  none: 0,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    headline: 'Manrope_700Bold',
    headlineExtra: 'Manrope_800ExtraBold',
    body: 'HankenGrotesk_500Medium',
    bodySemi: 'HankenGrotesk_600SemiBold',
    label: 'HankenGrotesk_600SemiBold',
    // System fallbacks when custom fonts aren't loaded yet
    headlineFallback: 'System',
    bodyFallback: 'System',
  },
  fontSize: {
    labelMd: 12,
    bodySm: 14,
    bodyMd: 16,
    bodyLg: 18,
    headlineSm: 20,
    headlineMd: 24,
    headlineLgMobile: 26,
    headlineLg: 30,
  },
  lineHeight: {
    labelMd: 16,
    bodySm: 20,
    bodyMd: 24,
    bodyLg: 26,
    headlineSm: 28,
    headlineMd: 32,
    headlineLgMobile: 34,
    headlineLg: 38,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  letterSpacing: {
    labelMd: 0.6,
    headlineMd: -0.24,
    headlineLg: -0.6,
    headlineLgMobile: -0.26,
  },
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

/** @deprecated Use CivicBuild tokens above — removed as screens migrate. */
export const legacy = {
  colors: {
    primary: {
      300: '#a5b8fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      900: '#312e81',
    },
    surface: {
      DEFAULT: '#1a1a2e',
      secondary: '#16213e',
      tertiary: '#0f3460',
      card: '#1e2a4a',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      muted: '#475569',
    },
    white: '#ffffff',
    error: '#ef4444',
    border: '#1e293b',
  },
  typography: {
    fontSize: {
      xs: 11,
      sm: 13,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
    },
    fontWeight: {
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  spacing: {
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 2,
      elevation: 2,
    },
  },
} as const;

const theme = { colors, spacing, borderRadius, typography, shadows, animation, legacy };

export default theme;
