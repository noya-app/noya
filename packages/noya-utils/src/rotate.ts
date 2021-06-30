/**
 * Rotates the elements within the given array so that the element at
 * the index specified by `toStartAt` becomes the start of the array.
 */
export function rotate<T>(array: T[], toStartAt: number): T[] {
  let start = toStartAt % array.length;

  if (start < 0) {
    start += array.length;
  }

  if (array.length < 2 || start === 0) return array;

  return [...array.slice(start), ...array.slice(0, start)];
}
