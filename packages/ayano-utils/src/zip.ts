export function zip<A, B>(a: A[], b: B[]): [A, B][];
export function zip<A, B, C>(a: A[], b: B[], c: C[]): [A, B, C][];
export function zip<A, B, C, D>(a: A[], b: B[], c: C[], d: D[]): [A, B, C, D][];
export function zip<A, B, C, D, E>(
  a: A[],
  b: B[],
  c: C[],
  d: D[],
  e: E[],
): [A, B, C, D, E][];

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
