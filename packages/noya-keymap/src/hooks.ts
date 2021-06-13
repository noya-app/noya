import { useEffect, useMemo, useRef } from 'react';
import { createKeyMap } from './keyMap';
import { getCurrentPlatform } from './platform';
import { getEventShortcutNames } from './shortcuts';

type KeyEventName = 'keydown' | 'keyup' | 'keypress';

type KeyMapDefinition = Parameters<typeof createKeyMap>[0];

export function useKeyboardShortcuts(shortcuts: KeyMapDefinition): void;
export function useKeyboardShortcuts(
  eventName: KeyEventName,
  shortcuts: KeyMapDefinition,
): void;
export function useKeyboardShortcuts(
  ...args: [KeyMapDefinition] | [KeyEventName, KeyMapDefinition]
) {
  const [eventName, shortcuts] =
    args.length === 1 ? (['keydown', args[0]] as const) : args;

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
