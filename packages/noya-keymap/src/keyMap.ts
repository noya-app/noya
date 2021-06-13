import { PlatformName } from './platform';
import { getPlatformShortcutName, PlatformShortcutKey } from './shortcuts';

export type KeyCommand = () => void;

export type KeyMap = Record<string, KeyCommand>;

export function createKeyMap(
  shortcuts: [string | PlatformShortcutKey, KeyCommand][] | KeyMap,
  platformName: PlatformName,
): KeyMap {
  if (!Array.isArray(shortcuts)) return shortcuts;

  return Object.fromEntries(
    shortcuts.flatMap(([key, command]) => {
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
