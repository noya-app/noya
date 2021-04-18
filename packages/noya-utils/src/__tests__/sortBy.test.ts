import { sortBy } from '../index';

test('empty array', () => {
  expect(sortBy([], '')).toEqual([]);
});
