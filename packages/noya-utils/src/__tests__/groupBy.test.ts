import { groupBy } from '../index';

test('group by even or odd', () => {
  expect(
    groupBy([0, 1, 2, 3, 4, 5], (value) => (value % 2 === 0 ? 'even' : 'odd')),
  ).toEqual({
    even: [0, 2, 4],
    odd: [1, 3, 5],
  });
});
