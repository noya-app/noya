import { windowsOf } from './windowsOf';

function isIncreasing(values: number[]) {
  return windowsOf(values, 2).every(([a, b]) => a < b);
}

function lerp(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}

function findLastIndex<T>(
  array: Array<T>,
  predicate: (value: T, index: number, obj: T[]) => boolean,
): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i, array)) return i;
  }

  return -1;
}

export type InterpolateOptions = {
  inputRange: number[];
  outputRange: number[];
};

export function interpolate(
  value: number,
  { inputRange, outputRange }: InterpolateOptions,
): number {
  if (inputRange.length !== outputRange.length) {
    throw new Error(
      'interpolate(): `inputRange` and `outputRange` must have the same length',
    );
  }

  if (inputRange.length === 0 || outputRange.length === 0) {
    throw new Error(
      'interpolate(): `inputRange` and `outputRange` must not be empty',
    );
  }

  if (inputRange.some(isNaN) || outputRange.some(isNaN)) {
    throw new Error(
      'interpolate(): `inputRange` and `outputRange` must not contain NaN',
    );
  }

  if (!isIncreasing(inputRange)) {
    throw new Error(
      'interpolate(): `inputRange` must be an array of increasing numbers',
    );
  }

  const index = findLastIndex(inputRange, (number) => value > number);

  if (index === -1) {
    return outputRange[0];
  } else if (index === inputRange.length - 1) {
    return outputRange[index];
  } else {
    const t =
      (value - inputRange[index]) / (inputRange[index + 1] - inputRange[index]);

    return lerp(outputRange[index], outputRange[index + 1], t);
  }
}
