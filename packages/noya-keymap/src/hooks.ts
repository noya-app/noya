import { useEffect, useMemo, useRef } from 'react';
import { createKeyMap, KeyCommand } from './keyMap';
import { getCurrentPlatform } from './platform';
import { getEventShortcutNames, PlatformShortcutKey } from './shortcuts';

type KeyEventName = 'keydown' | 'keyup' | 'keypress';

export function useKeyboardShortcuts(
  shortcuts: Parameters<typeof createKeyMap>[0],
  eventName: KeyEventName = 'keydown',
) {
  const platformName = getCurrentPlatform(navigator);

  const keyMap = useMemo(() => createKeyMap(shortcuts, platformName), [
    platformName,
    shortcuts,
  ]);

  const keyMapRef = useRef(keyMap);

  useEffect(() => {
    keyMapRef.current = keyMap;
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      const eventShortcutNames = getEventShortcutNames(event, platformName);

      const matchingName = eventShortcutNames.find(
        (name) => name in keyMapRef.current,
      );

      if (!matchingName) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const command = keyMapRef.current[matchingName];

      command();
    };

    document.addEventListener(eventName, handler, true);

    return () => {
      document.removeEventListener(eventName, handler, true);
    };
  }, [eventName, platformName]);
}

export function useKeyboardShortcut(
  shortcutKey: string | PlatformShortcutKey,
  command: KeyCommand,
): void;
export function useKeyboardShortcut(
  shortcutKey: string | PlatformShortcutKey,
  eventName: KeyEventName,
  command: KeyCommand,
): void;
export function useKeyboardShortcut(
  ...args:
    | [string | PlatformShortcutKey, KeyCommand]
    | [string | PlatformShortcutKey, KeyEventName, KeyCommand]
) {
  const [key, eventName, command] =
    args.length === 2 ? ([args[0], 'keypress', args[1]] as const) : args;

  return useKeyboardShortcuts([[key, command]], eventName);
}
