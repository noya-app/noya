import { base, keyName } from 'w3c-keyname';
import { KeyModifiers, normalizeKeyName, prependModifiers } from './names';
import { PlatformName } from './platform';

export type PlatformShortcutKey = Partial<Record<PlatformName, string>>;

export function getPlatformShortcutName(
  key: PlatformShortcutKey,
  platformName: PlatformName,
) {
  const platformKey = key[platformName] || key.key;

  return platformKey ? normalizeKeyName(platformKey, platformName) : undefined;
}

const modifierKeyNames = new Set(['Alt', 'Control', 'Meta', 'Shift']);

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

  const normalizedEventKey = normalizeKeyName(
    modifierKeyNames.has(eventKeyName)
      ? eventKeyName
      : prependModifiers(eventKeyName, eventModifiers, !isChar),
    platformName,
  );

  let shortcutNames: string[] = [normalizedEventKey];

  const baseName = base[event.keyCode];

  if (isChar) {
    let alternate: string | undefined;

    if (
      // Holding these keys may change the key that gets entered,
      // e.g. pressing "Alt" + "a" will enter "å". However, we can look
      // at the basename to get the actual key pressed.
      (event.shiftKey || event.altKey || event.metaKey) &&
      baseName &&
      baseName !== normalizedEventKey
    ) {
      alternate = normalizeKeyName(
        prependModifiers(baseName, eventModifiers, true),
        platformName,
      );
    } else if (event.shiftKey) {
      alternate = normalizeKeyName(
        prependModifiers(normalizedEventKey, eventModifiers, true),
        platformName,
      );
    }

    if (alternate && !shortcutNames.includes(alternate)) {
      shortcutNames.push(alternate);
    }
  }

  return shortcutNames;
}
