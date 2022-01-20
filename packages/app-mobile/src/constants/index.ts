import { Theme } from 'noya-designsystem/theme';
import * as noyaLight from 'noya-designsystem/theme/light';
import * as noyaDark from 'noya-designsystem/theme/dark';

export const lightTheme = noyaLight;
export const darkTheme = noyaDark;

declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {}
}
