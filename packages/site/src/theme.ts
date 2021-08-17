import { lightTheme } from 'noya-designsystem';
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
  // canvas: {
  //   background: 'rgb(249,249,249)',
  //   dragHandleStroke: 'rgba(180,180,180,0.5)',
  // },
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
  normal: "'Inter', Helvetica, Arial, sans-serif",
  monospace: "Menlo, Monaco, Consolas, 'Courier New', monospace",
};

const typeScale = [5, 4, 3, 2, 1, 0.85];

export const textStyles: {
  [key: string]: CSSObject;
} = {
  heading1: {
    fontSize: `${typeScale[0]}rem`,
    fontWeight: 700,
    lineHeight: '1.15',
  },
  heading2: {
    fontSize: `${typeScale[1]}rem`,
    fontWeight: 500,
    lineHeight: '1.2',
  },
  heading3: {
    fontSize: `${typeScale[2]}rem`,
    fontWeight: 500,
    lineHeight: '1.75',
  },
  body1: {
    fontSize: `${typeScale[3]}rem`,
    fontWeight: 400,
    lineHeight: '1.5',
  },
  body2: {
    fontSize: `${typeScale[4]}rem`,
    fontWeight: 400,
    lineHeight: '1.75',
  },
  mark: {
    background: 'linear-gradient(180deg, #E3BEFF, #A734FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
};

export const sizes = lightTheme.sizes;
