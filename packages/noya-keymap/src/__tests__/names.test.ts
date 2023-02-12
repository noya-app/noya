import { normalizeKeyName, prependModifiers } from '../names';

test('determines key name', () => {
  expect(
    prependModifiers(
      'Enter',
      {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
      },
      true,
    ),
  ).toEqual('Enter');

  expect(
    prependModifiers(
      'Enter',
      {
        altKey: true,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
      },
      true,
    ),
  ).toEqual('Ctrl-Alt-Enter');

  expect(
    prependModifiers(
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
    prependModifiers(
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
  expect(normalizeKeyName('shift', 'mac')).toEqual('Shift');
  expect(normalizeKeyName('mod', 'mac')).toEqual('Meta');
  expect(normalizeKeyName('mod', 'win')).toEqual('Ctrl');
  expect(normalizeKeyName('Mod', 'mac')).toEqual('Meta');
  expect(normalizeKeyName(' ', 'mac')).toEqual(' ');
  expect(normalizeKeyName('Space', 'mac')).toEqual(' ');
});
