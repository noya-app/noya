import * as lightTheme from './light';

export type Theme = typeof lightTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

export interface Colors {}

export interface TextStyles {
  heading1: string;
  heading2: string;
  heading3: string;
  body: string;
}
