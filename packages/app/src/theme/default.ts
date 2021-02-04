import mediaQuery from '../utils/mediaQuery';
import { CSSObject } from 'styled-components';

export const colors = {
  text: 'rgb(38, 48, 83)',
  textMuted: 'rgb(85, 85, 85)',
  textDecorativeLight: 'rgb(168, 185, 212)',
  // textLink: 'rgb(51, 122, 183)',
  textLink: 'rgb(58, 108, 234)',
  textLinkFocused: 'rgb(35, 82, 124)',
  divider: 'rgba(0, 0, 0, 0.07)',
  primary: 'rgb(132, 63, 255)',
  primaryDark: 'rgb(116, 36, 255)',
  // primary: 'rgb(59, 108, 212)',
  neutralBackground: 'rgb(222,223,232)',
  inputBackground: 'rgb(240, 240, 242)',
  codeBackground: 'rgb(250, 250, 250)',
  selectedBackground: 'rgb(242, 245, 250)',
  banner: {
    top: 'rgb(222, 229, 255)',
    // bottom: 'rgb(238, 235, 255)',
    // top: 'rgba(244, 247, 252, 1)',
    bottom: 'rgba(252, 252, 254, 1)',
  },
  title: {
    get left() {
      return colors.primary;
    },
    right: '#b9a2ff',
    // right: '#93d8ff'
  },
  button: {
    primaryText: 'white',
    secondaryText: 'white',
    get primaryBackground() {
      return colors.primary;
    },
    secondaryBackground: 'rgb(160, 160, 160)',
  },
  icon: 'rgb(86,93,120)',
};

export const fonts = {
  normal: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  monospace: "Menlo, Monaco, Consolas, 'Courier New', monospace",
};

// The last one, 0.85, I just eyeballed
const typeScale = [3.052, 2.441, 1.953, 1.563, 1.25, 1, 0.85]; // Major third

export const textStyles = {
  title: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[0]}rem`,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: '1.4',
    [mediaQuery.small]: {
      fontSize: '36px',
    },
  } as CSSObject,
  subtitle: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[3]}rem`,
    fontWeight: 500,
    color: colors.text,
    lineHeight: '1.75',
    [mediaQuery.small]: {
      fontSize: '18px',
    },
  } as CSSObject,
  heading1: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[2]}rem`,
    fontWeight: 500,
    color: colors.text,
    lineHeight: '1.75',
  } as CSSObject,
  heading2: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[3]}rem`,
    fontWeight: 500,
    color: colors.text,
    lineHeight: '1.75',
  } as CSSObject,
  heading3: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[4]}rem`,
    fontWeight: 500,
    color: colors.text,
    lineHeight: '1.75',
  } as CSSObject,
  body: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[5]}rem`,
    fontWeight: 400,
    lineHeight: '1.75',
    color: colors.text,
  } as CSSObject,
  small: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[6]}rem`,
    fontWeight: 400,
    lineHeight: '1.4',
    color: colors.textMuted,
  } as CSSObject,
  code: {
    fontFamily: fonts.monospace,
    fontSize: '90%',
    lineHeight: '1.5',
    color: colors.textMuted,
  } as CSSObject,
  sidebar: {
    title: {
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: '84px',
      color: colors.text,
    } as CSSObject,
    row: {
      fontSize: '14px',
      fontWeight: 400,
      color: colors.textMuted,
    } as CSSObject,
    rowSmall: {
      fontSize: '13px',
      fontWeight: 400,
      color: colors.textMuted,
    } as CSSObject,
  },
};

export const sizes = {
  sidebarWidth: 260,
  spacing: {
    nano: 2,
    micro: 4,
    small: 8,
    medium: 16,
    large: 32,
    xlarge: 64,
    xxlarge: 128,
  },
};
