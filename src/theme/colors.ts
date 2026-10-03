// Backwards-compatible exports for older imports.
export { darkTheme, lightTheme } from './theme';
export type { AppTheme } from './theme';

export const Colors = {
  background: '#F4F0EA',
  card: '#FFF8E7',
  cream: '#EAD8C3',
  leather: '#D8B28C',
  wood: '#B88B67',
  charcoal: '#3A3A3A',
  black: '#1E1E1E',
  silver: '#A3A5A6',
  onDark: '#FFF8E7',
  error: '#B85C4A',
} as const;
