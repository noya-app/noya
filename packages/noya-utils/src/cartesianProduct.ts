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
  let result: unknown[][] = [[]];

  // Iterate over each array, and for each element in the array, add it to each
  // existing combination. The result will grow exponentially with each array.
  for (const array of arrays) {
    const tempResult: unknown[][] = [];

    for (const existingCombo of result) {
      for (const element of array) {
        tempResult.push([...existingCombo, element]);
      }
    }

    result = tempResult;
  }

  return result;
}
