export function partition<T, U extends T>(
  array: readonly T[],
  predicate: (item: T) => item is U,
): [U[], Exclude<T, U>[]];
export function partition<T>(
  array: readonly T[],
  predicate: (item: T) => boolean,
): [T[], T[]];
export function partition<T>(
  array: readonly T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const left: T[] = [];
  const right: T[] = [];

  for (const item of array) {
    if (predicate(item)) {
      left.push(item);
    } else {
      right.push(item);
    }
  }

  return [left, right];
}
