export type Invert<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};

export function invert<T extends Record<PropertyKey, PropertyKey>>(
  record: T,
): Invert<T> {
  return Object.fromEntries(
    Object.entries(record).map(([type, extension]) => [extension, type]),
  ) as Invert<typeof record>;
}
