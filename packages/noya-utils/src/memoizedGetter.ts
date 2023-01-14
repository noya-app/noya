export function memoizedGetter<T>(
  target: unknown,
  propertyKey: string,
  value: T,
): T {
  Object.defineProperty(target, propertyKey, { value, writable: false });
  return value;
}
