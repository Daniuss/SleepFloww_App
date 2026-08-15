// Paleta baseada no design system validado (contraste + daltonismo já checados).
// Ver PROJETO.md — não é paleta "no olho", os valores vêm de uma referência testada.

export const statusColors = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
} as const;

export const light = {
  page: '#f9f9f7',
  surface: '#fcfcfb',
  card: '#ffffff',
  primaryInk: '#0b0b0b',
  secondaryInk: '#52514e',
  mutedInk: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
  border: 'rgba(11,11,11,0.10)',
  brand: '#2a78d6',
  brandSoft: '#cde2fb',
  successText: '#006300',
  ...statusColors,
};

export const dark = {
  page: '#0d0d0d',
  surface: '#1a1a19',
  card: '#1a1a19',
  primaryInk: '#ffffff',
  secondaryInk: '#c3c2b7',
  mutedInk: '#898781',
  gridline: '#2c2c2a',
  baseline: '#383835',
  border: 'rgba(255,255,255,0.10)',
  brand: '#3987e5',
  brandSoft: '#184f95',
  successText: '#0ca30c',
  ...statusColors,
};

export type ThemeColors = typeof light;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  hero: { fontSize: 34, fontWeight: '700' as const },
  title: { fontSize: 20, fontWeight: '700' as const },
  subtitle: { fontSize: 15, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
};
