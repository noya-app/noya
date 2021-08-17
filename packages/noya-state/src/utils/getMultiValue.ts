export function getMultiValue<T>(
  values: T[],
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b,
): T | undefined {
  if (values.length === 1) {
    return values[0];
  } else if (values.length > 1) {
    const first = values[0];

    return values.every((v) => isEqual(v, first)) ? first : undefined;
  } else {
    return undefined;
  }
}
