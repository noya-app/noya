import { PlatformName } from './platform';
import { getPlatformShortcutName, PlatformKeyboardShortcut } from './shortcuts';

export const FALLTHROUGH = 'fallthrough';

export type KeyCommand = () => void | typeof FALLTHROUGH;

export type KeyMap = Record<string, KeyCommand>;

export type KeyShortcuts =
  | [string | PlatformKeyboardShortcut, KeyCommand][]
  | KeyMap;

export function createKeyMap(
  shortcuts: KeyShortcuts,
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
