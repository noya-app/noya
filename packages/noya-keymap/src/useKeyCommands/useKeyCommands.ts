import { useEffect, useMemo, useRef } from 'react';

import { createKeyMap } from '../utils/createKeyMap';
import { getEventShortcutNames } from '../utils/shortcuts';
import type {
  Shortcuts,
  KeyCommand,
  NativeKeyCommand,
  KeyCommandOptions,
  KeyCommandCallback,
} from '../types';
import { getCurrentPlatform } from '../Platform';

export const IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS = 'ignore-global-events';

function getCommandCallback(command: KeyCommand): KeyCommandCallback {
  if (typeof command === 'function') {
    return command;
  }

  const { callback } = command as NativeKeyCommand;
  return callback;
}

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

      const command = getCommandCallback(keyMapRef.current[matchingName]);

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
