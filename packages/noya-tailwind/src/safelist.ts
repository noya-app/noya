// MIT https://github.com/spatie/tailwind-safelist-generator

import { cartesianProduct } from '@noya-app/noya-utils';

// See https://stackoverflow.com/a/47063174
function deepKeys(
  object: Record<string, any>,
  separator: string = '.',
  prefix: string = '',
): string[] {
  return Object.keys(object).reduce<string[]>((result, key) => {
    if (Array.isArray(object[key])) {
      return [...result, prefix + key];
    } else if (typeof object[key] === 'object' && object[key] !== null) {
      return [
        ...result,
        ...deepKeys(object[key], separator, prefix + key + separator),
      ];
    }

    return [...result, prefix + key];
  }, []);
}

export type ThemeFunction = (key: string) => any;

const extractTokens = (pattern: string): string[] =>
  pattern.split(/(?={[^}]+})|(?<={[^}]+})/);

const expandTokens =
  (theme: ThemeFunction) =>
  (tokens: string[]): string[][] =>
    tokens.map((token) =>
      token.startsWith('{')
        ? deepKeys(theme(token.replace(/{|}/g, '')), '-')
        : [token],
    );

const mapToClasses = (expanded: string[][]): string[] =>
  expanded.map((values) => values.join('').replace('-DEFAULT', ''));

export const generateClasses =
  (theme: ThemeFunction) =>
  (patterns: string[]): string[] =>
    patterns
      .map(extractTokens)
      .map(expandTokens(theme))
      .map((arrays) => cartesianProduct(...arrays)) // Assuming cartesianProduct is imported
      .flatMap(mapToClasses);
