import { cartesianProduct } from '../cartesianProduct';

test('product 2x0', () => {
  expect(cartesianProduct([1, 2], [])).toEqual([]);

  expect(cartesianProduct([], [1, 2])).toEqual([]);
});

test('product 1x1', () => {
  expect(cartesianProduct([1], [2])).toEqual([[1, 2]]);
});

test('product 2x2', () => {
  expect(cartesianProduct([1, 2], [3, 4])).toEqual([
    [1, 3],
    [1, 4],
    [2, 3],
    [2, 4],
  ]);

  expect(cartesianProduct([3, 4], [1, 2])).toEqual([
    [3, 1],
    [3, 2],
    [4, 1],
    [4, 2],
  ]);
});

test('product 2x3', () => {
  expect(cartesianProduct([1, 2], ['a', 'b'], ['x', 'y'])).toEqual([
    [1, 'a', 'x'],
    [1, 'a', 'y'],
    [1, 'b', 'x'],
    [1, 'b', 'y'],
    [2, 'a', 'x'],
    [2, 'a', 'y'],
    [2, 'b', 'x'],
    [2, 'b', 'y'],
  ]);
});

test('product 3x2', () => {
  expect(cartesianProduct([1, 2, 3], ['a', 'b', 'c'])).toEqual([
    [1, 'a'],
    [1, 'b'],
    [1, 'c'],
    [2, 'a'],
    [2, 'b'],
    [2, 'c'],
    [3, 'a'],
    [3, 'b'],
    [3, 'c'],
  ]);
});

test('product 3x3', () => {
  expect(cartesianProduct([1, 2, 3], ['a', 'b', 'c'], ['x', 'y', 'z'])).toEqual(
    [
      [1, 'a', 'x'],
      [1, 'a', 'y'],
      [1, 'a', 'z'],
      [1, 'b', 'x'],
      [1, 'b', 'y'],
      [1, 'b', 'z'],
      [1, 'c', 'x'],
      [1, 'c', 'y'],
      [1, 'c', 'z'],
      [2, 'a', 'x'],
      [2, 'a', 'y'],
      [2, 'a', 'z'],
      [2, 'b', 'x'],
      [2, 'b', 'y'],
      [2, 'b', 'z'],
      [2, 'c', 'x'],
      [2, 'c', 'y'],
      [2, 'c', 'z'],
      [3, 'a', 'x'],
      [3, 'a', 'y'],
      [3, 'a', 'z'],
      [3, 'b', 'x'],
      [3, 'b', 'y'],
      [3, 'b', 'z'],
      [3, 'c', 'x'],
      [3, 'c', 'y'],
      [3, 'c', 'z'],
    ],
  );
});
