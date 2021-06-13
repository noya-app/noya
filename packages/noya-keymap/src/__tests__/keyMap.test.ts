import { createKeyMap } from '../keyMap';

test('creates a keymap from an array', () => {
  const aCallback = () => {};
  const bCallback = () => {};
  expect(
    createKeyMap(
      [
        ['a', aCallback],
        ['b', bCallback],
      ],
      'key',
    ),
  ).toEqual({
    a: aCallback,
    b: bCallback,
  });
});
