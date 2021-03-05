import produce from 'immer';
import * as lightTheme from './light';

export const colors = produce(lightTheme.colors, (colors) => {
  colors.text = 'rgb(248,248,250)';
  colors.inputBackground = 'rgb(50,50,52)';
  colors.textMuted = 'rgb(180,180,180)';
  colors.divider = 'rgba(255,255,255,0.1)';
  colors.dividerStrong = 'rgba(0,0,0,1)';
  colors.canvas.background = 'rgb(19,20,21)';
  colors.sidebar.background = 'rgba(40,40,40,0.85)';
  colors.popover.background = 'rgb(40,40,40)';
  colors.listView.raisedBackground = 'rgba(255,255,255,0.1)';
  colors.slider.background = '#BBB';
});
export const textStyles = lightTheme.textStyles;
export const fonts = lightTheme.fonts;
export const sizes = lightTheme.sizes;
