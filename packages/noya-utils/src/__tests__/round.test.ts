import { round } from '..';

test('rounds down to precision', () => {
  const number = 1.1111111;
  expect(round(number, 0)).toEqual(1);
  expect(round(number, 1)).toEqual(1.1);
  expect(round(number, 2)).toEqual(1.11);
  expect(round(number, 3)).toEqual(1.111);
  expect(round(number, 4)).toEqual(1.1111);
});

test('rounds whole numbers', () => {
  expect(round(0, 0)).toEqual(0);
  expect(round(0, 1)).toEqual(0);
  expect(round(42, 0)).toEqual(42);
  expect(round(42, 1)).toEqual(42);
});

test('rounds up to precision', () => {
  const number = 5.5555555;
  expect(round(number, 0)).toEqual(6);
  expect(round(number, 1)).toEqual(5.6);
  expect(round(number, 2)).toEqual(5.56);
  expect(round(number, 3)).toEqual(5.556);
  expect(round(number, 4)).toEqual(5.5556);
});
