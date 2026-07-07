import theme from '@theme/index';

export interface CategoryTheme {
  emoji: string;
  label: string;
  backgroundColor: string;
  textColor: string;
}

export const CATEGORY_THEME: Record<string, CategoryTheme> = {
  cement: {
    emoji: '🧱',
    label: 'CEMENT',
    backgroundColor: theme.colors.tertiaryFixed,
    textColor: theme.colors.onTertiaryFixed,
  },
  blocks: {
    emoji: '🧱',
    label: 'BLOCKS',
    backgroundColor: theme.colors.surfaceContainerHigh,
    textColor: theme.colors.onSurface,
  },
  gravel: {
    emoji: '🪨',
    label: 'GRAVEL',
    backgroundColor: theme.colors.secondaryContainer,
    textColor: theme.colors.onSecondaryContainer,
  },
  steel: {
    emoji: '🔩',
    label: 'STEEL',
    backgroundColor: theme.colors.inverseSurface,
    textColor: theme.colors.inversePrimary,
  },
  roofing: {
    emoji: '🏠',
    label: 'ROOFING',
    backgroundColor: theme.colors.primaryContainer,
    textColor: theme.colors.onPrimaryContainer,
  },
  tiles: {
    emoji: '🔲',
    label: 'TILES',
    backgroundColor: theme.colors.primaryFixedDim,
    textColor: theme.colors.onPrimaryContainer,
  },
  paint: {
    emoji: '🎨',
    label: 'PAINT',
    backgroundColor: theme.colors.errorContainer,
    textColor: theme.colors.onErrorContainer,
  },
  plumbing: {
    emoji: '🚰',
    label: 'PLUMBING',
    backgroundColor: theme.colors.secondaryFixed,
    textColor: theme.colors.onSecondaryContainer,
  },
  electrical: {
    emoji: '⚡',
    label: 'ELECTRICAL',
    backgroundColor: theme.colors.tertiaryContainer,
    textColor: theme.colors.onTertiaryContainer,
  },
};

export function getCategoryTheme(categoryId: string): CategoryTheme {
  return (
    CATEGORY_THEME[categoryId.toLowerCase()] ?? {
      emoji: '📦',
      label: categoryId.toUpperCase(),
      backgroundColor: theme.colors.surfaceContainer,
      textColor: theme.colors.onSurfaceVariant,
    }
  );
}
