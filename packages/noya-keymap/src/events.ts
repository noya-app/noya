import { createKeyMap, FALLTHROUGH, KeyShortcuts } from './keyMap';
import { PlatformName } from './platform';
import { getEventShortcutNames } from './shortcuts';

export const handleKeyboardEvent = (
  event: KeyboardEvent,
  platformName: PlatformName,
  shortcuts: KeyShortcuts,
) => {
  const keyMap = createKeyMap(shortcuts, platformName);

  const eventShortcutNames = getEventShortcutNames(event, platformName);

  const matchingName = eventShortcutNames.find((name) => name in keyMap);

  if (!matchingName) return;

  const command = keyMap[matchingName];

  const result = command();

  if (result !== FALLTHROUGH) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};
