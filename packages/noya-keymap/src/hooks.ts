import { useEffect, useMemo, useRef } from 'react';
import { createKeyMap } from './keyMap';
import { getCurrentPlatform } from './platform';
import { getEventShortcutNames } from './shortcuts';

export const IGNORE_GLOBAL_EVENTS_CLASS = 'ignore-global-events';

type KeyEventName = 'keydown' | 'keyup' | 'keypress';

type KeyMapDefinition = Parameters<typeof createKeyMap>[0];

interface KeyboardEventListener {
  addEventListener: (
    name: string,
    handler: (keyboardEvent: KeyboardEvent) => void,
  ) => void;
  removeEventListener: (
    name: string,
    handler: (keyboardEvent: KeyboardEvent) => void,
  ) => void;
}

interface KeyboardShortcutOptions {
  eventName?: KeyEventName;

  /**
   * A custom event listener.
   *
   * Pass null to ignore events, e.g. if the listener element hasn't mounted yet.
   * This is similar to conditionally disabling the hook.
   */
  eventListener?: KeyboardEventListener | null;
}

export function useKeyboardShortcuts(
  shortcuts: KeyMapDefinition,
  options: KeyboardShortcutOptions = {},
) {
  const eventName = options.eventName ?? 'keydown';
  const eventRef = useMemo(
    () =>
      options.eventListener !== undefined ? options.eventListener : document,
    [options?.eventListener],
  );

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
      if (
        event.target instanceof HTMLInputElement &&
        !event.target.classList.contains(IGNORE_GLOBAL_EVENTS_CLASS)
      )
        return;

      const eventShortcutNames = getEventShortcutNames(event, platformName);

      const matchingName = eventShortcutNames.find(
        (name) => name in keyMapRef.current,
      );

      if (!matchingName) return;

      const command = keyMapRef.current[matchingName];

      const result = command();

      if (result !== 'fallthrough') {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const listenerElement = eventRef;

    listenerElement?.addEventListener(eventName, handler);

    return () => {
      listenerElement?.removeEventListener(eventName, handler);
    };
  }, [eventName, eventRef, platformName]);
}
