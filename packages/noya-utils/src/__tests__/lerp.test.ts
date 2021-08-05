import { lerp } from '..';

test('lerp', () => {
  expect(lerp(0, 100, -0.5)).toEqual(-50);
  expect(lerp(0, 100, 0)).toEqual(0);
  expect(lerp(0, 100, 0.5)).toEqual(50);
  expect(lerp(0, 100, 1)).toEqual(100);
  expect(lerp(0, 100, 1.5)).toEqual(150);
});
