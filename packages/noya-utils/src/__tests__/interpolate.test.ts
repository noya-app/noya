import { interpolate } from '../index';

test('interpolate between 2 numbers', () => {
  const options = {
    inputRange: [0, 1],
    outputRange: [0, 100],
  };
  expect(interpolate(-0.5, options)).toEqual(0);
  expect(interpolate(0, options)).toEqual(0);
  expect(interpolate(0.5, options)).toEqual(50);
  expect(interpolate(1, options)).toEqual(100);
  expect(interpolate(1.5, options)).toEqual(100);
});

test('interpolate between 3 numbers', () => {
  const options = {
    inputRange: [0, 1, 3],
    outputRange: [-100, 0, 100],
  };
  expect(interpolate(-0.5, options)).toEqual(-100);
  expect(interpolate(0, options)).toEqual(-100);
  expect(interpolate(0.5, options)).toEqual(-50);
  expect(interpolate(1, options)).toEqual(0);
  expect(interpolate(2, options)).toEqual(50);
  expect(interpolate(3.5, options)).toEqual(100);
});

test('interpolate throws', () => {
  expect(() => interpolate(0, { inputRange: [], outputRange: [] })).toThrow();
  expect(() =>
    interpolate(0, { inputRange: [0], outputRange: [0, 1] }),
  ).toThrow();
  expect(() =>
    interpolate(0, { inputRange: [0], outputRange: [Number.NaN] }),
  ).toThrow();
  expect(() =>
    interpolate(0, { inputRange: [1, 0], outputRange: [0, 1] }),
  ).toThrow();
});
