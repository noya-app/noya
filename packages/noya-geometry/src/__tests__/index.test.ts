import { distance } from '../index';

test('calculate distance', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 5, y: 5 };
  expect(distance(a, b)).toEqual(5 * Math.sqrt(2));
});
