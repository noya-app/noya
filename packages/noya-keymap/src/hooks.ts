import { useEffect, useMemo, useRef } from 'react';
import { handleKeyboardEvent } from './events';
import { KeyShortcuts } from './keyMap';
import { getCurrentPlatform } from './platform';

export const IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS = 'ignore-global-events';

type KeyEventName = 'keydown' | 'keyup' | 'keypress';

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
  shortcuts: KeyShortcuts,
  options: KeyboardShortcutOptions = {},
) {
  const eventName = options.eventName ?? 'keydown';
  const eventRef = useMemo(
    () =>
      options.eventListener !== undefined ? options.eventListener : document,
    [options?.eventListener],
  );

  const platformName = getCurrentPlatform(navigator);

  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement) &&
        !event.target.classList.contains(IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS)
      )
        return;

      handleKeyboardEvent(event, platformName, shortcutsRef.current);
    };

    const listenerElement = eventRef;

    listenerElement?.addEventListener(eventName, handler);

    return () => {
      listenerElement?.removeEventListener(eventName, handler);
    };
  }, [eventName, eventRef, platformName]);
}
