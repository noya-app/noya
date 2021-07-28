import mediaQuery from '../mediaQuery';
import { CSSObject } from 'styled-components';

export const colors = {
  text: 'rgb(38, 48, 83)',
  textMuted: 'rgb(85, 85, 85)',
  textDisabled: 'rgb(160, 160, 160)',
  textDecorativeLight: 'rgb(168, 185, 212)',
  // textLink: 'rgb(51, 122, 183)',
  textLink: 'rgb(58, 108, 234)',
  textLinkFocused: 'rgb(35, 82, 124)',
  divider: 'rgba(0, 0, 0, 0.07)',
  dividerStrong: 'rgba(0, 0, 0, 0.09)',
  primary: 'rgb(132, 63, 255)',
  primaryDark: 'rgb(116, 36, 255)',
  neutralBackground: 'rgb(222,223,232)',
  inputBackground: 'rgb(240, 240, 242)',
  codeBackground: 'rgb(250, 250, 250)',
  selectedBackground: 'rgb(242, 245, 250)',
  transparentChecker: 'rgba(255,255,255,0.8)',
  scrollbar: 'rgba(199,199,199,0.8)',
  placeholderDots: 'rgba(0,0,0,0.3)',
  listView: {
    raisedBackground: 'rgba(255,255,255,0.8)',
  },
  canvas: {
    background: 'rgb(249,249,249)',
    dragHandleStroke: 'rgba(180,180,180,0.5)',
    measurement: 'rgb(207,92,42)',
    sliceOutline: 'rgb(150,150,150)',
  },
  sidebar: {
    background: 'rgba(252,252,252,0.85)',
  },
  popover: {
    background: 'rgb(252,252,252)',
  },
  slider: {
    background: 'white',
    border: '#BBB',
  },
  icon: 'rgb(139, 139, 139)',
  iconSelected: 'rgb(220, 220, 220)',
  mask: 'rgb(12,193,67)',
  imageOverlay:
    'linear-gradient(0deg, rgba(132, 63, 255,0.55), rgba(132, 63, 255,0.55))',
  get dragOutline() {
    return colors.primary;
  },
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
    lineHeight: '1.4',
    [mediaQuery.small]: {
      fontSize: '36px',
    },
  } as CSSObject,
  subtitle: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[3]}rem`,
    fontWeight: 500,
    lineHeight: '1.75',
    [mediaQuery.small]: {
      fontSize: '18px',
    },
  } as CSSObject,
  heading1: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[2]}rem`,
    fontWeight: 500,
    lineHeight: '1.75',
  } as CSSObject,
  heading2: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[3]}rem`,
    fontWeight: 500,
    lineHeight: '1.75',
  } as CSSObject,
  heading3: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[4]}rem`,
    fontWeight: 500,
    lineHeight: '1.75',
  } as CSSObject,
  body: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[5]}rem`,
    fontWeight: 400,
    lineHeight: '1.75',
  } as CSSObject,
  small: {
    fontFamily: fonts.normal,
    fontSize: `${typeScale[6]}rem`,
    fontWeight: 400,
    lineHeight: '1.4',
  } as CSSObject,
  code: {
    fontFamily: fonts.monospace,
    fontSize: '90%',
    lineHeight: '1.5',
  } as CSSObject,
};

export const sizes = {
  sidebarWidth: 260,
  toolbar: {
    height: 46,
    itemSeparator: 8,
  },
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
