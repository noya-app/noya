import {
  getEventShortcutNames,
  getPlatformShortcutName,
  PlatformKeyboardShortcut,
} from '../shortcuts';

test('picks a shortcut key for the given platform', () => {
  const shortcut: PlatformKeyboardShortcut = {
    key: 'k',
    mac: 'm',
    win: 'w',
  };

  expect(getPlatformShortcutName(shortcut, 'key')).toEqual('k');
  expect(getPlatformShortcutName(shortcut, 'mac')).toEqual('m');
  expect(getPlatformShortcutName(shortcut, 'win')).toEqual('w');
  expect(getPlatformShortcutName(shortcut, 'linux')).toEqual('k');
});

test('supports platform-specific commands', () => {
  const shortcut: PlatformKeyboardShortcut = {
    mac: 'm',
  };

  expect(getPlatformShortcutName(shortcut, 'mac')).toEqual('m');
  expect(getPlatformShortcutName(shortcut, 'win')).toEqual(undefined);
});

test('gets event shortcut name', () => {
  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'd',
        keyCode: 100,
        shiftKey: false,
      }),
      'mac',
    ),
  ).toEqual(['d']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'D',
        keyCode: 68,
        shiftKey: true,
      }),
      'mac',
    ),
  ).toEqual(['D', 'Shift-d']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: '2',
        keyCode: 50,
      }),
      'mac',
    ),
  ).toEqual(['2']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: '2',
        keyCode: 50,
        shiftKey: true,
      }),
      'mac',
    ),
  ).toEqual(['@', 'Shift-2']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: '@',
        keyCode: 64,
        shiftKey: true,
      }),
      'mac',
    ),
  ).toEqual(['@', 'Shift-@']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: ' ',
        keyCode: 32,
      }),
      'mac',
    ),
  ).toEqual([' ']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: ' ',
        keyCode: 32,
        shiftKey: true,
      }),
      'mac',
    ),
  ).toEqual(['Shift- ']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'ArrowUp',
        keyCode: 38,
      }),
      'mac',
    ),
  ).toEqual(['ArrowUp']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'ArrowUp',
        keyCode: 38,
        shiftKey: true,
      }),
      'mac',
    ),
  ).toEqual(['Shift-ArrowUp']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'Shift',
        keyCode: 16,
        shiftKey: true,
      }),
      'mac',
    ),
  ).toEqual(['Shift']);
});
