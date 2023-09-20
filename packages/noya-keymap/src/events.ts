import {
  createKeyMap,
  FALLTHROUGH,
  KeyCommandFunction,
  KeyShortcuts,
} from './keyMap';
import { PlatformName } from './platform';
import { getEventShortcutNames } from './shortcuts';

const matchShortcut = (
  event: KeyboardEvent,
  platformName: PlatformName,
  shortcuts: KeyShortcuts,
  options: { invokedWithinInput?: boolean } = {},
): KeyCommandFunction | undefined => {
  const keyMap = createKeyMap(shortcuts, platformName);

  const eventShortcutNames = getEventShortcutNames(event, platformName);

  const matchingName = eventShortcutNames.find((name) => name in keyMap);

  if (!matchingName) return;

  const command = keyMap[matchingName];

  const commandObject = typeof command === 'function' ? { command } : command;

  if (options.invokedWithinInput && !commandObject.allowInInput) return;

  return commandObject.command;
};

export const handleKeyboardEvent = (
  event: KeyboardEvent,
  platformName: PlatformName,
  shortcuts: KeyShortcuts,
  options: { invokedWithinInput?: boolean } = {},
) => {
  const command = matchShortcut(event, platformName, shortcuts, options);

  if (!command) return;

  const result = command();

  if (result !== FALLTHROUGH) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};
