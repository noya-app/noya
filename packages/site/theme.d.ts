import { siteTheme } from 'noya-designsystem';

export type LocalColors = typeof siteTheme.colors;
export type LocalTextStyles = typeof siteTheme.textStyles;

declare module 'noya-designsystem' {
  export interface Colors extends LocalColors {}
  export interface TextStyles extends LocalTextStyles {}
}
