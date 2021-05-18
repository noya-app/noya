import { modifiers, normalizeKeyName } from '..';

test('determines key name', () => {
  expect(
    modifiers(
      'Enter',
      {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      },
      false,
    ),
  ).toEqual('Enter');

  expect(
    modifiers(
      'Enter',
      {
        altKey: true,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
      },
      false,
    ),
  ).toEqual('Ctrl-Alt-Enter');

  expect(
    modifiers(
      'Enter',
      {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
      },
      true,
    ),
  ).toEqual('Shift-Enter');

  expect(
    modifiers(
      'Enter',
      {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
      },
      false,
    ),
  ).toEqual('Enter');
});

test('normalizes key name', () => {
  expect(normalizeKeyName('cmd-shift-d', 'mac')).toEqual('Shift-Meta-d');
});
