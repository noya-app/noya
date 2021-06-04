import { chunkBy } from '../index';

test('chunk empty array', () => {
  expect(chunkBy([], (a, b) => a <= b)).toEqual([]);
});

test('chunk one value', () => {
  expect(chunkBy([1], (a, b) => a <= b)).toEqual([[1]]);
});

test('chunk two values', () => {
  expect(chunkBy([1, 2], (a, b) => a <= b)).toEqual([[1, 2]]);
  expect(chunkBy([2, 1], (a, b) => a <= b)).toEqual([[2], [1]]);
});

test('chunk three values', () => {
  expect(chunkBy([1, 3, 2], (a, b) => a <= b)).toEqual([[1, 3], [2]]);
  expect(chunkBy([2, 1, 3], (a, b) => a <= b)).toEqual([[2], [1, 3]]);
});

test('chunk numbers', () => {
  expect(chunkBy([10, 20, 30, 10, 40, 40, 10, 20], (a, b) => a <= b)).toEqual([
    [10, 20, 30],
    [10, 40, 40],
    [10, 20],
  ]);
});
