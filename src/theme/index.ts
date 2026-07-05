// ─── Colors ─────────────────────────────────────────────────────────────────
export const colors = {
  // Brand
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c7d6fe',
    300: '#a5b8fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  accent: {
    purple: '#a855f7',
    pink: '#ec4899',
    orange: '#f97316',
    cyan: '#06b6d4',
  },
  // Surfaces (dark mode first)
  surface: {
    DEFAULT: '#1a1a2e',
    secondary: '#16213e',
    tertiary: '#0f3460',
    card: '#1e2a4a',
    modal: '#243352',
  },
  // Text
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    muted: '#475569',
    inverse: '#0f172a',
  },
  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  // Utilities
  border: '#1e293b',
  overlay: 'rgba(0,0,0,0.6)',
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'Courier New',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

// ─── Animation Durations ─────────────────────────────────────────────────────
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

const theme = { colors, spacing, borderRadius, typography, shadows, animation };

export default theme;
