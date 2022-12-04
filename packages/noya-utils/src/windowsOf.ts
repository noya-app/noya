import { TupleOf } from './types';

export function windowsOf<T, N extends number>(
  array: T[],
  size: N,
  wrapsAround = false,
): TupleOf<T, N>[] {
  let arr = array;

  if (arr.length < size) return [];

  if (wrapsAround) {
    arr = array.slice();

    for (let i = 0; i < size - 1; i++) {
      arr.push(array[i]);
    }
  }

  const result: TupleOf<T, N>[] = [];

  for (let i = 0; i <= arr.length - size; i++) {
    result.push(arr.slice(i, i + size) as TupleOf<T, N>);
  }

  return result;
}
