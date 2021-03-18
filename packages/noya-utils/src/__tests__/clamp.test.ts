import { clamp } from '../index';

test('above max', () => {
  expect(clamp(17, 0, 10)).toEqual(10);
});

test('below min', () => {
  expect(clamp(-7, 0, 10)).toEqual(0);
});

test('within range', () => {
  expect(clamp(7, 0, 10)).toEqual(7);
});
