import { isNumberEqual } from '../index';

test('equal', () => {
  expect(isNumberEqual(160000, 160000)).toEqual(true);
  expect(isNumberEqual(160000.00000000006, 160000)).toEqual(true);
});
