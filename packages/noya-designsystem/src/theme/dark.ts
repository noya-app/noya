import produce from 'immer';
import * as lightTheme from './light';

export const colors = produce(lightTheme.colors, (colors) => {
  colors.text = 'rgb(248,248,250)';
  colors.textMuted = 'rgb(180,180,180)';
  colors.textDisabled = 'rgb(100,100,100)';
  colors.inputBackground = 'rgb(50,50,52)';
  colors.divider = 'rgba(255,255,255,0.08)';
  colors.dividerStrong = 'rgba(0,0,0,1)';
  colors.canvas.background = 'rgb(19,20,21)';
  colors.canvas.sliceOutline = 'rgb(150,150,150)';
  colors.sidebar.background = 'rgba(40,40,40,0.95)';
  colors.popover.background = 'rgb(40,40,40)';
  colors.listView.raisedBackground = 'rgba(255,255,255,0.1)';
  colors.slider.background = '#BBB';
  colors.mask = 'rgb(102,187,106)';
  colors.transparentChecker = 'rgba(255,255,255,0.3)';
  colors.scrollbar = 'rgba(199,199,199,0.2)';
  colors.placeholderDots = 'rgba(255,255,255,0.3)';
  colors.dragOutline = 'white';
  colors.activeBackground = 'rgba(255,255,255,0.08)';
});

export { textStyles, fonts, sizes } from './light';
