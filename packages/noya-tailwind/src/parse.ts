import { memoize } from '@noya-app/noya-utils';

export type ParsedTailwindClassName = {
  className: string;
  prefix?: string;
  opacity?: string;
};

export const parseTailwindClassName = memoize(function parseTailwindClassName(
  className: string,
): ParsedTailwindClassName {
  const match = className.match(/^(\w+:)?(.*?)(\/\d*)?$/);

  if (!match) return { className };

  const [, prefix, classNameWithoutPrefix, opacity] = match;

  return {
    className: classNameWithoutPrefix,
    ...(prefix && { prefix: prefix.slice(0, -1) }),
    ...(opacity !== undefined && { opacity: opacity.slice(1) }),
  };
});

export function stringifyTailwindClassName({
  className,
  prefix,
  opacity,
}: ParsedTailwindClassName) {
  return `${prefix ? `${prefix}:` : ''}${className}${
    opacity ? `/${opacity}` : ''
  }`;
}
