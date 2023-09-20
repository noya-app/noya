import { useEffect, useRef } from 'react';
import { handleKeyboardEvent } from './events';
import { KeyShortcuts } from './keyMap';
import { getCurrentPlatform } from './platform';

export const KEYBOARD_SHORTCUT_PASSTHROUGH_CLASS = 'ignore-global-events';

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
}

const listenerElement: KeyboardEventListener | null =
  typeof window !== 'undefined' ? window : null;
const platformName =
  typeof navigator !== 'undefined' ? getCurrentPlatform(navigator) : 'key';

export function useKeyboardShortcuts(
  shortcuts: KeyShortcuts,
  options: KeyboardShortcutOptions = {},
) {
  const eventName = options.eventName ?? 'keydown';

  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const invokedWithinInput = elementShouldHandleOwnShortcut(event.target);

      handleKeyboardEvent(event, platformName, shortcutsRef.current, {
        invokedWithinInput,
      });
    };

    listenerElement?.addEventListener(eventName, handler);

    return () => {
      listenerElement?.removeEventListener(eventName, handler);
    };
  }, [eventName]);
}

export function elementShouldHandleOwnShortcut(target: EventTarget | null) {
  // Events without a target are not relevant for us here
  if (!(target instanceof HTMLElement)) return true;

  let element = target;

  const closestContentEditable: HTMLElement | null =
    element.closest('[contenteditable]');

  if (closestContentEditable) {
    element = closestContentEditable;
  }

  // If an element has the passthrough class, we should handle the event globally
  if (element.classList.contains(KEYBOARD_SHORTCUT_PASSTHROUGH_CLASS)) {
    return false;
  }

  // Check if we're within an input/textarea/contenteditable
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element.hasAttribute('contenteditable')
  ) {
    return true;
  }

  return false;
}
