import * as defaultTheme from './default';

export { defaultTheme };

export type Theme = typeof defaultTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
