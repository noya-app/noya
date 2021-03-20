import { sum } from '../index';

test('empty array', () => {
  expect(sum([])).toEqual(0);
});

test('sum', () => {
  expect(sum([-7, 2, 10])).toEqual(5);
});
