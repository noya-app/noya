import type {
  KeyMap,
  KeyCommand,
  PlatformName,
  PlatformKeyboardShortcut,
} from '../types';
import { getPlatformShortcutName } from './shortcuts';

export function createKeyMap(
  shortcuts: [string | PlatformKeyboardShortcut, KeyCommand][] | KeyMap,
  platformName: PlatformName,
): KeyMap {
  const shortcutsArray = Array.isArray(shortcuts)
    ? shortcuts
    : Object.entries(shortcuts);

  return Object.fromEntries(
    shortcutsArray.flatMap(([key, command]) => {
      const platformShortcutName = getPlatformShortcutName(
        typeof key === 'string' ? { key } : key,
        platformName,
      );

      return platformShortcutName
        ? [[platformShortcutName, command] as const]
        : [];
    }),
  );
}
