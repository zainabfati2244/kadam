/** Shared semantic colors used by every screen. */
export type AppTheme = {
  background: string;
  text: string;
  card: string;
  primary: string;
  border: string;
  mutedText: string;
  statusBar: 'light-content' | 'dark-content';
};

export const lightTheme: AppTheme = {
  background: '#F4F0EA',
  text: '#725436',
  card: '#FFF8E7',
  primary: '#b87f51',
  border: '#EAD8C3',
  mutedText: '#855c3b',
  statusBar: 'dark-content',
};

export const darkTheme: AppTheme = {
  background: '#1E1E1E',
  text: '#F4F0EA',
  card: '#3A3A3A',
  primary: '#8a735b',
  border: '#c9b1a3',
  mutedText: '#A3A5A6',
  statusBar: 'light-content',
};
