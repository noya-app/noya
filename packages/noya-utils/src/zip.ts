export function zip<A, B>(...arrays: [A[], B[]]): [A, B][];
export function zip<A, B, C>(...arrays: [A[], B[], C[]]): [A, B, C][];
export function zip<A, B, C, D>(
  ...arrays: [A[], B[], C[], D[]]
): [A, B, C, D][];
export function zip<A, B, C, D, E>(
  ...arrays: [A[], B[], C[], D[], E[]]
): [A, B, C, D, E][];
export function zip<T>(...arrays: T[][]): T[][];

/**
 * Make an array of tuples containing the nth element of each array.
 *
 * If input arrays are different lengths, the resulting array of tuples will
 * have the same length as the shortest input array.
 */
export function zip(...arrays: unknown[][]): unknown[][] {
  const length = Math.min(...arrays.map((array) => array.length));

  const result: unknown[][] = [];

  for (let i = 0; i < length; i++) {
    result[i] = [];

    for (let j = 0; j < arrays.length; j++) {
      result[i][j] = arrays[j][i];
    }
  }

  return result;
}

/**
 * Make an array of tuples containing the nth element of each array.
 *
 * If input arrays are different lengths, the resulting array of tuples will
 * have the same length as the longest input array, and any holes will
 * be filled with `fillValue`.
 */
export function zipLongest<T>(fillValue: T, ...arrays: T[][]): T[][] {
  const length = Math.max(...arrays.map((array) => array.length));

  // Fill each array with `fillValue` up to the length of the largest array
  const filledArrays = arrays.map((array) => {
    const copy = [...array];
    copy.length = length;
    copy.fill(fillValue, array.length);
    return copy;
  });

  return zip(...filledArrays);
}
