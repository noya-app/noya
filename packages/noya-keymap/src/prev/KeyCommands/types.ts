import { createKeyMap } from '../keyMap';

export type KeyEventName = 'keydown' | 'keyup' | 'keypress';

export type KeyMapDefinition = Parameters<typeof createKeyMap>[0];

export interface KeyboardEventListener {
  addEventListener: (
    name: string,
    handler: (keyboardEvent: KeyboardEvent) => void,
  ) => void;
  removeEventListener: (
    name: string,
    handler: (keyboardEvent: KeyboardEvent) => void,
  ) => void;
}

export interface KeyboardShortcutOptions {
  eventName?: KeyEventName;

  /**
   * A custom event listener.
   *
   * Pass null to ignore events, e.g. if the listener element hasn't mounted yet.
   * This is similar to conditionally disabling the hook.
   */
  eventListener?: KeyboardEventListener | null;
}
