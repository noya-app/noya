import { BreakpointKey, extractClassNamesByBreakpoint } from './breakpoints';
import { ColorSchemeKey, extractClassNamesByColorScheme } from './colorSchemes';

export function extractClassNames(
  classNames: string[],
  {
    colorScheme,
    breakpoint,
  }: {
    colorScheme?: ColorSchemeKey;
    breakpoint?: BreakpointKey;
  } = {},
): string[] {
  if (colorScheme) {
    classNames = extractClassNamesByColorScheme(classNames, colorScheme);
  }

  if (breakpoint) {
    classNames = extractClassNamesByBreakpoint(classNames, breakpoint);
  }

  return classNames;
}
