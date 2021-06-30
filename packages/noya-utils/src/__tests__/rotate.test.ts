import { rotate } from '../index';

test('rotate empty array', () => {
  expect(rotate([], 10)).toEqual([]);
});

test('rotate one value', () => {
  expect(rotate([1], 10)).toEqual([1]);
});

test('rotate two values', () => {
  expect(rotate([1, 2], -3)).toEqual([2, 1]);
  expect(rotate([1, 2], -2)).toEqual([1, 2]);
  expect(rotate([1, 2], -1)).toEqual([2, 1]);
  expect(rotate([1, 2], 0)).toEqual([1, 2]);
  expect(rotate([1, 2], 1)).toEqual([2, 1]);
  expect(rotate([1, 2], 2)).toEqual([1, 2]);
});

test('rotate three values', () => {
  expect(rotate([1, 2, 3], -1)).toEqual([3, 1, 2]);
  expect(rotate([1, 2, 3], 0)).toEqual([1, 2, 3]);
  expect(rotate([1, 2, 3], 1)).toEqual([2, 3, 1]);
  expect(rotate([1, 2, 3], 2)).toEqual([3, 1, 2]);
  expect(rotate([1, 2, 3], 3)).toEqual([1, 2, 3]);
});
