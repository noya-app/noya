import { useEffect, useMemo, useRef } from 'react';
import { getCurrentPlatform } from './platform';
import {
  getEventShortcutNames,
  getPlatformShortcutName,
  PlatformShortcutKey,
} from './shortcuts';

type Command = () => void;

type KeyEventName = 'keydown' | 'keyup' | 'keypress';

export function useKeyboardShortcuts(
  shortcuts: [string | PlatformShortcutKey, Command][],
  eventName: KeyEventName = 'keydown',
) {
  const platformName = getCurrentPlatform(navigator);

  const keyMap = useMemo(
    () =>
      Object.fromEntries(
        shortcuts.flatMap(([key, command]) => {
          const platformShortcutName = getPlatformShortcutName(
            typeof key === 'string' ? { key } : key,
            platformName,
          );

          return platformShortcutName
            ? [[platformShortcutName, command] as const]
            : [];
        }),
      ),
    [platformName, shortcuts],
  );

  const keyMapRef = useRef(keyMap);

  useEffect(() => {
    keyMapRef.current = keyMap;
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      const eventShortcutNames = getEventShortcutNames(event, platformName);

      // console.log(
      //   event.key,
      //   event.keyCode,
      //   keyMapRef.current,
      //   eventShortcutNames,
      // );

      const matchingName = eventShortcutNames.find(
        (name) => name in keyMapRef.current,
      );

      if (!matchingName) return;

      event.preventDefault();
      event.stopPropagation();
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
  command: Command,
): void;
export function useKeyboardShortcut(
  shortcutKey: string | PlatformShortcutKey,
  eventName: KeyEventName,
  command: Command,
): void;
export function useKeyboardShortcut(
  ...args:
    | [string | PlatformShortcutKey, Command]
    | [string | PlatformShortcutKey, KeyEventName, Command]
) {
  const [key, eventName, command] =
    args.length === 2 ? ([args[0], 'keypress', args[1]] as const) : args;

  return useKeyboardShortcuts([[key, command]], eventName);
}
