import { windowsOf } from '../index';

test('pairs', () => {
  expect(windowsOf([], 2)).toEqual([]);
  expect(windowsOf([1], 2)).toEqual([]);
  expect(windowsOf([1, 2, 3, 4, 5], 2)).toEqual([
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
  ]);
  expect(windowsOf([1, 2, 3, 4, 5], 2, true)).toEqual([
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 1],
  ]);
});

test('triples', () => {
  expect(windowsOf([], 3)).toEqual([]);
  expect(windowsOf([1], 3)).toEqual([]);
  expect(windowsOf([1, 2], 3)).toEqual([]);
  expect(windowsOf([1, 2, 3, 4, 5], 3)).toEqual([
    [1, 2, 3],
    [2, 3, 4],
    [3, 4, 5],
  ]);
  expect(windowsOf([1, 2, 3, 4, 5], 3, true)).toEqual([
    [1, 2, 3],
    [2, 3, 4],
    [3, 4, 5],
    [4, 5, 1],
    [5, 1, 2],
  ]);
});
