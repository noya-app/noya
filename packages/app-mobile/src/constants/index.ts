import * as lightTheme from './lightTheme';

export * as lightTheme from './lightTheme';
export * as darkTheme from './darkTheme';

export type Theme = typeof lightTheme;

declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {}
}
