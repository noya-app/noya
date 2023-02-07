import produce from 'immer';
import * as lightTheme from './light';

export const colors = produce(lightTheme.colors, (colors) => {
  colors.logo.fill = 'rgb(248,248,250)';
  colors.logo.highlight = 'rgb(248,248,250)';
  colors.text = 'rgb(248,248,250)';
  colors.textMuted = 'rgb(180,179,182)';
  colors.textDisabled = 'rgb(100,99,102)';
  colors.inputBackground = 'rgba(181,178,255,0.08)';
  colors.inputBackgroundLight = 'rgba(181,178,255,0.10)';
  colors.dividerSubtle = 'rgba(255,255,255,0.04)';
  colors.divider = 'rgba(255,255,255,0.08)';
  colors.dividerStrong = 'rgba(0,0,0,1)';
  colors.primary = 'rgb(119, 66, 255)';
  colors.primaryLight = 'rgb(134, 86, 255)';
  colors.canvas.background = 'rgb(20,19,23)';
  colors.canvas.sliceOutline = 'rgb(150,150,150)';
  colors.canvas.grid = 'rgba(0,0,0,0.1)';
  colors.sidebar.background = 'rgba(34,33,39,0.95)';
  colors.popover.background = 'rgba(34,33,39,1)';
  colors.listView.raisedBackground = 'rgba(181,178,255,0.1)';
  colors.slider.background = '#BBB';
  colors.mask = 'rgb(102,187,106)';
  colors.transparentChecker = 'rgba(255,255,255,0.3)';
  colors.scrollbar = 'rgba(199,199,199,0.2)';
  colors.placeholderDots = 'rgba(255,255,255,0.3)';
  colors.dragOutline = 'white';
  colors.activeBackground = 'rgba(181,178,255,0.08)';
});

export { fonts, sizes, textStyles } from './light';
