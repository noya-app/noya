import { isEqualIgnoringUndefinedKeys } from '../isEqualIgnoringUndefinedKeys';

test('handles undefined keys specially', () => {
  expect(isEqualIgnoringUndefinedKeys({ a: undefined }, {})).toEqual(true);
  expect(isEqualIgnoringUndefinedKeys({}, { a: undefined })).toEqual(true);
  expect(
    isEqualIgnoringUndefinedKeys({ a: undefined }, { a: undefined }),
  ).toEqual(true);
  expect(isEqualIgnoringUndefinedKeys({ a: 123 }, { a: undefined })).toEqual(
    false,
  );
  expect(isEqualIgnoringUndefinedKeys({ a: undefined }, { b: 123 })).toEqual(
    false,
  );
});
