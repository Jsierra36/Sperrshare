import { Platform } from 'react-native';

// Palette v3 — exact tokens from the "Sperrshare" Stitch design system
// (Stich/stitch_ecomapa_de_objetos/stitch_sperrshare_sustainable_marketplace/sperrshare/DESIGN.md).
export const lightColors = {
  background: '#F9F9F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EDEEED',
  border: '#C2C9BB',
  text: '#191C1C',
  textMuted: '#42493E',
  primary: '#2D5A27',
  primaryDark: '#154212',
  secondary: '#4CAF50',
  secondaryContainer: '#E1F0DE',
  accent: '#FCD400',
  accentOrange: '#FF8C00',
  earth: '#795548',
  error: '#BA1A1A',
  success: '#2E7D32',
};

// Dark variant — same brand hues, re-tuned for contrast on a dark surface
// (brighter primary/error so they still read against near-black backgrounds).
export const darkColors = {
  background: '#121714',
  surface: '#1C231F',
  surfaceMuted: '#242C27',
  border: '#3A453E',
  text: '#F1F5F0',
  textMuted: '#A6B3A9',
  primary: '#5CA858',
  primaryDark: '#154212',
  secondary: '#4CAF50',
  secondaryContainer: '#26362A',
  accent: '#FCD400',
  accentOrange: '#FF8C00',
  earth: '#A47B65',
  error: '#FF7A6E',
  success: '#66BB6A',
};

export type ColorPalette = typeof lightColors;

// Default export kept for anything reading static colors outside the themed tree
// (e.g. before ThemeProvider mounts). Screens should use useTheme() instead.
export const colors = lightColors;

export const fonts = {
  heading: 'PlusJakartaSans_700Bold',
  headingSemibold: 'PlusJakartaSans_600SemiBold',
  body: 'BeVietnamPro_400Regular',
  bodyMedium: 'BeVietnamPro_500Medium',
  label: 'BeVietnamPro_600SemiBold',
};

// rounded-2xl/3xl per design.md — soft, organic shapes, no sharp corners in the main flow.
export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Floating action button diameter (profile/add on the map screen, recenter control on
// PostMap) — 34px base bumped 15% for visibility, per user request.
export const fabSize = 39;

// Reusable elevation for cards/buttons — subtle, tinted with the primary color
// per the "Ambient Shadows" note in docs/design.md rather than harsh black shadows.
// RN Web wants `boxShadow`; native RN wants shadow*/elevation — Platform.select covers both
// without triggering the "shadow* deprecated" web warning.
export const shadow = {
  card: Platform.select({
    web: { boxShadow: '0px 4px 20px rgba(21, 66, 18, 0.04)' },
    default: {
      shadowColor: '#154212',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 20,
      elevation: 2,
    },
  }),
  button: Platform.select({
    web: { boxShadow: '0px 3px 10px rgba(21, 66, 18, 0.2)' },
    default: {
      shadowColor: '#154212',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 3,
    },
  }),
};
