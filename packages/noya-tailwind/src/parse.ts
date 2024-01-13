export function parseTailwindClass(className: string) {
  const match = className.match(/^(\w+:)?(.*?)(\/\d*)?$/);

  if (!match) return { className };

  const [, prefix, classNameWithoutPrefix, opacity] = match;

  return {
    className: classNameWithoutPrefix,
    ...(prefix && { prefix: prefix.slice(0, -1) }),
    ...(opacity !== undefined && { opacity: opacity.slice(1) }),
  };
}

export function stringifyTailwindClass({
  className,
  prefix,
  opacity,
}: ReturnType<typeof parseTailwindClass>) {
  return `${prefix ? `${prefix}:` : ''}${className}${
    opacity ? `/${opacity}` : ''
  }`;
}
