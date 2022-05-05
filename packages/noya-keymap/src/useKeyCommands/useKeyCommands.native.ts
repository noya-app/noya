import { useEffect, useMemo, useRef } from 'react';
import { NativeEventEmitter, NativeModule, NativeModules } from 'react-native';

import { KeyedSet } from 'noya-utils';
import { createKeyMap } from '../utils/createKeyMap';
import { getCurrentPlatform } from '../Platform';
import type { Shortcuts, KeyCommandPriority, NativeKeyCommand } from '../types';
import type { UseKeyCommandsOptions } from './types';

interface RegistryCommand {
  command: string;
  title?: string;
  priority?: KeyCommandPriority;
}

const { KeyCommandRegistry } = NativeModules as {
  KeyCommandRegistry: NativeModule & {
    registerCommand: (options: RegistryCommand) => void;
    unregisterCommand: (options: { command: string }) => void;
  };
};

const callbacks = new KeyedSet<string, () => void>();
const eventEmitter = new NativeEventEmitter(KeyCommandRegistry);

eventEmitter.addListener('onKeyCommand', (options: { command: string }) => {
  callbacks.forEach(options.command, (callback) => callback());
});

function addCommand(command: string, keyCommand: NativeKeyCommand) {
  callbacks.add(command, keyCommand.callback);

  // If we have at least 1 command, add it to the native list of key commands.
  if (callbacks.size(command) === 1) {
    KeyCommandRegistry.registerCommand({
      command,
      title: keyCommand.title,
      priority: keyCommand.priority,
    });
  }
}

function deleteCommand(command: string, keyCommand: NativeKeyCommand) {
  callbacks.delete(command, keyCommand.callback);

  // If there are no commands left, remove it from the native list of key commands.
  if (callbacks.size(command) === 0) {
    KeyCommandRegistry.unregisterCommand({ command });
  }
}

export function useKeyCommands(
  shortcuts: Shortcuts,
  options: UseKeyCommandsOptions = {},
) {
  const platformName = getCurrentPlatform();
  const keyList = useMemo(
    () => Object.entries(createKeyMap(shortcuts, platformName)),
    [shortcuts, platformName],
  );

  console.log(keyList);

  useEffect(() => {
    keyList.forEach(([commandName, commandOptions]) => {
      addCommand(commandName, commandOptions as NativeKeyCommand);
    });

    return () => {
      keyList.forEach(([commadName, commandOptions]) => {
        deleteCommand(commadName, commandOptions as NativeKeyCommand);
      });
    };
  }, [keyList]);
}
