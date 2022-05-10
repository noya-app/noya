import { PlatformKeyboardShortcut } from '../../types';
import { getEventShortcutNames, getPlatformShortcutName } from '../shortcuts';

test('picks a shortcut key for the given platform', () => {
  const shortcut: PlatformKeyboardShortcut = {
    key: 'k',
    macos: 'm',
    windows: 'w',
  };

  expect(getPlatformShortcutName(shortcut, 'key')).toEqual('k');
  expect(getPlatformShortcutName(shortcut, 'macos')).toEqual('m');
  expect(getPlatformShortcutName(shortcut, 'windows')).toEqual('w');
  expect(getPlatformShortcutName(shortcut, 'linux')).toEqual('k');
});

test('supports platform-specific commands', () => {
  const shortcut: PlatformKeyboardShortcut = {
    macos: 'm',
  };

  expect(getPlatformShortcutName(shortcut, 'macos')).toEqual('m');
  expect(getPlatformShortcutName(shortcut, 'windows')).toEqual(undefined);
});

test('gets event shortcut name', () => {
  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'd',
        keyCode: 100,
        shiftKey: false,
      }),
      'macos',
    ),
  ).toEqual(['d']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'D',
        keyCode: 68,
        shiftKey: true,
      }),
      'macos',
    ),
  ).toEqual(['D', 'Shift-d']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: '2',
        keyCode: 50,
      }),
      'macos',
    ),
  ).toEqual(['2']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: '2',
        keyCode: 50,
        shiftKey: true,
      }),
      'macos',
    ),
  ).toEqual(['@', 'Shift-2']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: '@',
        keyCode: 64,
        shiftKey: true,
      }),
      'macos',
    ),
  ).toEqual(['@', 'Shift-@']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: ' ',
        keyCode: 32,
      }),
      'macos',
    ),
  ).toEqual([' ']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: ' ',
        keyCode: 32,
        shiftKey: true,
      }),
      'macos',
    ),
  ).toEqual(['Shift- ']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'ArrowUp',
        keyCode: 38,
      }),
      'macos',
    ),
  ).toEqual(['ArrowUp']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'ArrowUp',
        keyCode: 38,
        shiftKey: true,
      }),
      'macos',
    ),
  ).toEqual(['Shift-ArrowUp']);

  expect(
    getEventShortcutNames(
      new KeyboardEvent('keypress', {
        key: 'Shift',
        keyCode: 16,
        shiftKey: true,
      }),
      'macos',
    ),
  ).toEqual(['Shift']);
});
