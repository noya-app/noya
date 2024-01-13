import { parseTailwindClassName, stringifyTailwindClassName } from './parse';

export const breakpoints = [
  'base' as const,
  'sm' as const,
  'md' as const,
  'lg' as const,
  'xl' as const,
  '2xl' as const,
];

export type BreakpointKey = (typeof breakpoints)[number];

export function matchBreakpoint(width: number): BreakpointKey {
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'base';
}

export const extractClassNamesByBreakpoint = (
  classes: string[],
  breakpoint: BreakpointKey,
) => {
  const breakpointIndex = breakpoints.indexOf(breakpoint);
  const included = breakpoints.slice(0, breakpointIndex + 1);
  const excluded = breakpoints.slice(breakpointIndex + 1);

  return classes.flatMap((className): string[] => {
    const parsed = parseTailwindClassName(className);

    // If the class starts with a breakpoint in the set, return the class without the breakpoint
    for (const bp of included) {
      if (parsed.prefix === bp) {
        return [
          stringifyTailwindClassName({
            className: parsed.className,
            opacity: parsed.opacity,
          }),
        ];
      }
    }

    // If the class starts with a breakpoint not in the set, return nothing
    for (const bp of excluded) {
      if (parsed.prefix === bp) {
        return [];
      }
    }

    return [className];
  });
};
