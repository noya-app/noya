import { useEffect, useMemo, useRef } from 'react';

import { parseKeyCommand } from '../utils/parseKeyCommand';
import type { Shortcuts, KeyCommandOptions } from '../types';
import { getEventShortcutNames } from '../utils/shortcuts';
import { createKeyMap } from '../utils/createKeyMap';
import { getCurrentPlatform } from '../Platform';

export const IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS = 'ignore-global-events';

export function useKeyCommands(
  shortcuts: Shortcuts,
  options: KeyCommandOptions = {},
) {
  const eventName = options.eventName ?? 'keydown';
  const eventRef = useMemo(
    () =>
      options.eventListener !== undefined ? options.eventListener : document,
    [options?.eventListener],
  );

  const platformName = getCurrentPlatform(navigator);

  const keyMap = useMemo(
    () => createKeyMap(shortcuts, platformName),
    [platformName, shortcuts],
  );

  const keyMapRef = useRef(keyMap);

  useEffect(() => {
    keyMapRef.current = keyMap;
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement) &&
        !event.target.classList.contains(IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS)
      )
        return;

      const eventShortcutNames = getEventShortcutNames(event, platformName);

      const matchingName = eventShortcutNames.find(
        (name) => name in keyMapRef.current,
      );

      if (!matchingName) return;

      const command = parseKeyCommand(keyMapRef.current[matchingName]).callback;

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
