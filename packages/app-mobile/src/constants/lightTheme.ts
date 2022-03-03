export const colors = {
  text: 'rgb(38, 48, 83)',
  textMuted: 'rgb(85, 85, 85)',
  textSubtle: 'rgb(121, 121, 121)',
  textDisabled: 'rgb(160, 160, 160)',
  divider: 'rgba(0, 0, 0, 0.07)',
  dividerStrong: 'rgba(0, 0, 0, 0.09)',
  primary: 'rgb(132, 63, 255)',
  primaryDark: 'rgb(116, 36, 255)',
  primaryLight: 'rgb(147, 86, 255)',
  neutralBackground: 'rgb(222,223,232)',
  inputBackground: 'rgb(240, 240, 242)',
  codeBackground: 'rgb(250, 250, 250)',
  selectedBackground: 'rgb(242, 245, 250)',
  transparentChecker: 'rgba(255,255,255,0.8)',
  activeBackground: 'rgba(0,0,0,0.1)',
  scrollbar: 'rgba(199,199,199,0.8)',
  placeholderDots: 'rgba(0,0,0,0.3)',
  listView: {
    raisedBackground: 'rgba(0,0,0,0.03)',
  },
  canvas: {
    background: 'rgb(249,249,249)',
    dragHandleStroke: 'rgba(180,180,180,0.5)',
    measurement: 'rgb(207,92,42)',
    sliceOutline: 'rgb(210,210,210)',
    grid: 'rgba(0,0,0,0.05)',
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
  selection: 'rgb(179,215,254)',

  get dragOutline() {
    return colors.primary;
  },
};

export const fonts = {
  normal: 'BlinkMacSystemFont',
  //'\'BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Roboto, Helvetica, Arial, sans-serif\'',
  monospace: "Menlo, Monaco, Consolas, 'Courier New', monospace",
};

// The last one, 0.85, I just eyeballed
const baseFontSize = 16;
const typeScale = [
  3.052 * baseFontSize,
  2.441 * baseFontSize,
  1.953 * baseFontSize,
  1.563 * baseFontSize,
  1.25 * baseFontSize,
  1 * baseFontSize,
  0.85 * baseFontSize,
]; // Major third

export const textStyles = {
  title: {
    fontFamily: fonts.normal,
    fontSize: typeScale[0],
    fontWeight: 'bold',
    lineHeight: `${typeScale[0] * 1.4}px`,
  },
  subtitle: {
    fontFamily: fonts.normal,
    fontSize: typeScale[3],
    fontWeight: 500,
    lineHeight: `${typeScale[3] * 1.75}px`,
  },
  heading1: {
    fontFamily: fonts.normal,
    fontSize: typeScale[2],
    fontWeight: 500,
    lineHeight: `${typeScale[2] * 1.75}px`,
  },
  heading2: {
    fontFamily: fonts.normal,
    fontSize: typeScale[3],
    fontWeight: 500,
    lineHeight: `${typeScale[3] * 1.75}px`,
  },
  heading3: {
    fontFamily: fonts.normal,
    fontSize: typeScale[4],
    fontWeight: 500,
    lineHeight: `${typeScale[4] * 1.75}px`,
  },
  body: {
    fontFamily: fonts.normal,
    fontSize: typeScale[5],
    fontWeight: 400,
    lineHeight: `${typeScale[5] * 1.75}px`,
  },
  small: {
    fontFamily: fonts.normal,
    fontSize: typeScale[6],
    fontWeight: 400,
    lineHeight: `${typeScale[6] * 1.4}px`,
  },
  code: {
    fontFamily: fonts.monospace,
    fontSize: '90%',
    lineHeight: `${baseFontSize * 0.9 * 1.5}px`,
  },
  label: {
    fontFamily: fonts.normal,
    fontSize: 0.62 * baseFontSize,
    fontWeight: 400,
    lineHeight: `${baseFontSize & (0.62 * 1.4)}px`,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
};

export const sizes = {
  sidebarWidth: 260,
  toolbar: {
    height: 46,
    itemSeparator: 8,
  },
  inspector: {
    horizontalSeparator: 8,
    verticalSeparator: 10,
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
  dialog: {
    padding: 20,
  },
};
