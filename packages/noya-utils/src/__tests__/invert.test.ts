import { invert } from '../invert';

test('invert object', () => {
  const input = { a: 1, b: 2 } as const;
  const output = { 1: 'a', 2: 'b' } as const;

  expect<typeof output>(invert(input)).toEqual(output);
});
