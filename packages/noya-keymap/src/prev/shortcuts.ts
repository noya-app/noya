import { base, keyName } from 'w3c-keyname';

import { normalizeKeyName, prependModifiers } from './names';
import type {
  KeyModifiers,
  PlatformName,
  PlatformKeyboardShortcut,
} from '../types';

const modifierKeyNames = new Set(['Alt', 'Control', 'Meta', 'Shift']);

export function getPlatformShortcutName(
  shortcut: PlatformKeyboardShortcut,
  platformName: PlatformName,
) {
  const platformKey = shortcut[platformName] || shortcut.key;

  return platformKey ? normalizeKeyName(platformKey, platformName) : undefined;
}

export function getEventShortcutNames(
  event: KeyboardEvent,
  platformName: PlatformName,
) {
  const eventKeyName = keyName(event);
  const isChar = eventKeyName.length === 1 && eventKeyName !== ' ';

  const eventModifiers: KeyModifiers = {
    altKey: event.altKey,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
  };

  const eventShortcutName = normalizeKeyName(
    modifierKeyNames.has(eventKeyName)
      ? eventKeyName
      : prependModifiers(eventKeyName, eventModifiers, !isChar),
    platformName,
  );

  let shortcutNames: string[] = [eventShortcutName];

  const baseKeyName = base[event.keyCode];

  if (isChar) {
    let alternateShortcutName: string | undefined;

    if (
      // Holding these keys may change the key that gets entered,
      // e.g. pressing "Alt" + "a" will enter "å". However, we can look
      // at the basename to get the actual key pressed.
      (event.shiftKey || event.altKey || event.metaKey) &&
      baseKeyName &&
      baseKeyName !== eventShortcutName
    ) {
      alternateShortcutName = normalizeKeyName(
        prependModifiers(baseKeyName, eventModifiers, true),
        platformName,
      );
    } else if (event.shiftKey) {
      // At this point, we've previously added a shortcut like "@",
      // but we also want to add "Shift+@" for a more convenient API
      alternateShortcutName = normalizeKeyName(
        prependModifiers(eventShortcutName, eventModifiers, true),
        platformName,
      );
    }

    if (
      alternateShortcutName &&
      !shortcutNames.includes(alternateShortcutName)
    ) {
      shortcutNames.push(alternateShortcutName);
    }
  }

  return shortcutNames;
}
