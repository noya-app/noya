export function cartesianProduct<A, B>(...arrays: [A[], B[]]): [A, B][];
export function cartesianProduct<A, B, C>(
  ...arrays: [A[], B[], C[]]
): [A, B, C][];
export function cartesianProduct<A, B, C, D>(
  ...arrays: [A[], B[], C[], D[]]
): [A, B, C, D][];
export function cartesianProduct<A, B, C, D, E>(
  ...arrays: [A[], B[], C[], D[], E[]]
): [A, B, C, D, E][];
export function cartesianProduct<T>(...arrays: T[][]): T[][];

/**
 * Cartesian product of input arrays.
 */
export function cartesianProduct(...arrays: unknown[][]): unknown[][] {
  // Product of array lengths up to the current index
  // We leave the extra [1] in the front of the array since we use it later
  const lengths = arrays
    .map((array) => array.length)
    .reduce((result, value) => [...result, result[result.length - 1] * value], [
      1,
    ]);

  const resultLength = lengths[lengths.length - 1];
  const result = new Array<unknown[]>(resultLength);

  for (let arrayIndex = 0; arrayIndex < arrays.length; arrayIndex++) {
    const array = arrays[arrayIndex];

    for (let index = 0; index < resultLength; index++) {
      const repeat = lengths[lengths.length - 2 - arrayIndex];

      const wrappedIndex = Math.floor(index / repeat) % array.length;
      const value = array[wrappedIndex];

      if (arrayIndex === 0) {
        result[index] = [value];
      } else {
        result[index].push(value);
      }
    }
  }

  return result;
}
