import { findLast } from 'noya-utils';

export function getMappedParameters<T extends Record<string, string[]>>(
  parameters: string[] | Set<string> | undefined,
  mapping: T,
): {
  [K in keyof T]?: T[K][number];
} {
  const parameterSet =
    parameters instanceof Set ? parameters : new Set(parameters);

  const result: {
    [K in keyof T]?: T[K][number];
  } = {};

  Object.entries(mapping).forEach(([key, values]) => {
    const lastParameter = findLast(values, (parameter) =>
      parameterSet.has(parameter),
    );

    // If there's a mutually exclusive parameter, remove all others
    if (lastParameter) {
      result[key as keyof T] = lastParameter;
    }
  });

  return result;
}
