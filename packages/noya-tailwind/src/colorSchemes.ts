import { parseTailwindClassName, stringifyTailwindClassName } from './parse';

export const colorSchemes = ['light' as const, 'dark' as const];

export type ColorSchemeKey = (typeof colorSchemes)[number];

/**
 * Extracts the classes for the given theme. Omits the theme prefix.
 * Omits that are prefixed with a different theme.
 */
export const extractClassNamesByColorScheme = (
  classNames: string[],
  theme: (typeof colorSchemes)[number],
) => {
  return classNames.flatMap((className): string[] => {
    const parsed = parseTailwindClassName(className);

    if (parsed.prefix === theme) {
      return [
        stringifyTailwindClassName({
          className: parsed.className,
          opacity: parsed.opacity,
        }),
      ];
    }

    for (const colorScheme of colorSchemes) {
      if (parsed.prefix === colorScheme) {
        return [];
      }
    }

    return [className];
  });
};
