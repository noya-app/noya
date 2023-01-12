import { CSSObject } from 'styled-components';

type BreakpointKey = number | string;

export type Breakpoint<T extends object> = [BreakpointKey, T];

export type BreakpointCollection<T extends object> =
  | Breakpoint<T>[]
  | Record<BreakpointKey, T>;

export type StyleMap = Record<string, CSSObject>;

export function mergeBreakpoints(
  breakpoints: BreakpointCollection<CSSObject>,
): StyleMap;
export function mergeBreakpoints<T extends object>(
  breakpoints: BreakpointCollection<T>,
  transform?: (value: T) => CSSObject,
): StyleMap;
export function mergeBreakpoints<T extends object>(
  breakpoints: BreakpointCollection<T>,
  transform?: (value: T) => CSSObject,
): StyleMap {
  const breakpointMap = Array.isArray(breakpoints)
    ? breakpoints.reduce(
        (result: Record<number, T>, item: any /* TODO Fix type */) => {
          const [key, value] = item;
          result[key] = result[key] ? { ...result[key], ...value } : value;
          return result;
        },
        {},
      )
    : breakpoints;

  const breakpointList = Object.entries(breakpointMap) as Breakpoint<T>[];

  const transformedList = breakpointList
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([width, value]: Breakpoint<T>) => [
      `@media screen and (max-width: ${width}px)`,
      transform?.(value) ?? value,
    ]);

  return Object.fromEntries(transformedList);
}
