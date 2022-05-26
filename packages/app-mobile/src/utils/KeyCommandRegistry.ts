import { NativeEventEmitter, NativeModule, NativeModules } from 'react-native';

import { KeyedSet } from 'noya-utils';

export type KeyCommandPriority = 'standard' | 'system';

export type KeyCommand = {
  command: string;
  title?: string;
  priority?: KeyCommandPriority;
};

const { KeyCommandRegistry } = NativeModules as {
  KeyCommandRegistry: NativeModule & {
    registerCommand: (options: KeyCommand) => void;
    unregisterCommand: (options: { command: string }) => void;
  };
};

const callbacks = new KeyedSet<string, () => void>();

const eventEmitter = new NativeEventEmitter(KeyCommandRegistry);

eventEmitter.addListener('onKeyCommand', (options: { command: string }) => {
  callbacks.forEach(options.command, (callback) => callback());
});

function addCommand(options: KeyCommand, callback: () => void) {
  callbacks.add(options.command, callback);

  // If we have at least 1 command, add it to the native list of key commands.
  if (callbacks.size(options.command) === 1) {
    KeyCommandRegistry.registerCommand(options);
  }
}

function deleteCommand(options: KeyCommand, callback: () => void) {
  callbacks.delete(options.command, callback);

  // If there are no commands left, remove it from the native list of key commands.
  if (callbacks.size(options.command) === 0) {
    KeyCommandRegistry.unregisterCommand(options);
  }
}

/**
 * We use the command string as an id, so it's important that
 * a command string always has the same format.
 *
 * E.g. "command-shift-a" and "shift-command-a" should map to
 * the same id.
 */
function normalizeCommand(command: string) {
  const parts = command.toLowerCase().split('-');

  const key = parts[parts.length - 1];
  const hasCommand = parts.includes('command');
  const hasShift = parts.includes('shift');
  const hasOption = parts.includes('option');

  return [
    hasCommand && 'command',
    hasShift && 'shift',
    hasOption && 'option',
    key,
  ]
    .flatMap((value) => (value ? [value] : []))
    .join('-');
}

export function registerKeyCommand(
  options: string | KeyCommand,
  callback: () => void,
) {
  const optionsObject: KeyCommand =
    typeof options === 'string' ? { command: options } : options;

  const normalized: KeyCommand = {
    priority: 'standard',
    ...optionsObject,
    command: normalizeCommand(optionsObject.command),
  };

  addCommand(normalized, callback);

  return () => {
    deleteCommand(normalized, callback);
  };
}
