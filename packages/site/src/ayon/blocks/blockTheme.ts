import { tailwindColors } from '../tailwind/tailwind.config';

export const accentColor = tailwindColors.blue;
export const neutralColor = tailwindColors.slate;

export const buttonColors = {
  light: {
    backgroundColor: '#f1f5f9',
    color: '#000',
  },
  lightDisabled: {
    backgroundColor: '#c2c8d0',
    color: '#000',
  },
  dark: {
    backgroundColor: '#475569',
    color: '#fff',
  },
  darkDisabled: {
    backgroundColor: '#8799b2',
    color: '#fff',
  },
};

export function getBlockThemeColors({
  dark,
  accent,
}: {
  dark: boolean;
  accent: boolean;
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
export function getBlockThemeColorClasses({
  dark,
  accent,
}: {
  dark: boolean;
  accent: boolean;
}) {
  const permutation = `${dark ? 'dark' : 'light'}${
    accent ? '-accent' : ''
  }` as const;

  switch (permutation) {
    case 'dark':
      return {
        text: '#text-white',
        bg: `#bg-[${neutralColor[900]}e5] #backdrop-blur`,
        activeLinkBg: '#bg-slate-700',
        borderColor: '#border-transparent',
      };
    case 'light':
      return {
        text: '#text-black',
        bg: '#bg-[#ffffffe5] #backdrop-blur',
        activeLinkBg: '#bg-slate-100',
        borderColor: '#border-gray-200',
      };
    case 'dark-accent':
      return {
        text: '#text-white',
        bg: `#bg-[${accentColor[800]}e5] #backdrop-blur`,
        activeLinkBg: '#bg-blue-600',
        borderColor: '#border-transparent',
      };
    case 'light-accent':
      return {
        text: '#text-blue-900',
        bg: `#bg-[${accentColor[50]}e5] #backdrop-blur`,
        activeLinkBg: '#bg-blue-100',
        borderColor: '#border-gray-200',
      };
  }
}
