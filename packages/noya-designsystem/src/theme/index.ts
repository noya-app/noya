import * as lightTheme from './light';

export type Theme = typeof lightTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

export interface Colors {}

type PickByValue<T, V> = Pick<
  T,
  // Remove any value that extends V
  { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T]
>;

export type ThemeColorName = keyof PickByValue<Theme['colors'], string>;
