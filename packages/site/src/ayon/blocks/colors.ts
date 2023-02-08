import { ParsedBlockParameter } from '../parse';
import { accentColor } from './blockTheme';

export function getBlockThemeColors({
  dark,
  accent,
}: {
  dark: ParsedBlockParameter;
  accent: ParsedBlockParameter;
}) {
  const permutation = `${dark ? 'dark' : 'light'}${
    accent ? '-accent' : ''
  }` as const;

  switch (permutation) {
    case 'dark':
      return {
        backgroundColor: 'rgba(11,21,48,0.9)',
        borderColor: 'transparent',
        searchBackgroundColor: 'rgba(0,0,0,0.2)',
        color: '#fff',
        activeLinkBackgroundColor: 'rgba(255,255,255,0.1)',
      };
    case 'light':
      return {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: '#eee',
        searchBackgroundColor: 'rgba(0,0,0,0.02)',
        color: '#000',
        activeLinkBackgroundColor: 'rgba(0,0,0,0.1)',
      };
    case 'dark-accent':
      return {
        backgroundColor: accentColor[800],
        borderColor: 'transparent',
        searchBackgroundColor: 'rgba(0,0,0,0.2)',
        color: '#fff',
        activeLinkBackgroundColor: 'rgba(255,255,255,0.1)',
      };
    case 'light-accent':
      return {
        backgroundColor: accentColor[50],
        borderColor: 'rgba(0,0,0,0.05)',
        searchBackgroundColor: 'rgba(0,0,0,0.02)',
        color: 'rgba(0,0,0,0.8)',
        activeLinkBackgroundColor: accentColor[100],
      };
  }
}
