import { useEffect, useMemo, useRef } from 'react';
import { NativeEventEmitter, NativeModule, NativeModules } from 'react-native';

import { parseKeyCommand } from '../utils/parseKeyCommand';
import { createKeyMap } from '../utils/createKeyMap';
import { getCurrentPlatform } from '../Platform';
import { KeyMap, Shortcuts, KeyCommand, KeyCommandPriority } from '../types';

interface RegistryCommand {
  command: string;
  title?: string;
  menuName?: string;
  priority?: KeyCommandPriority;
}

interface CallbackMap {
  [key: string]: () => void;
}

interface SimpleCommand {
  command: string;
}

const { KeyCommandRegistry } = NativeModules as {
  KeyCommandRegistry: NativeModule & {
    registerCommands: (commands: RegistryCommand[]) => void;
    unregisterCommands: (comamnds: string[]) => void;
  };
};

function buildCommandOptions(
  command: string,
  keyCommand: KeyCommand,
): RegistryCommand {
  const commandOptions: RegistryCommand = {
    command,
  };

  if (typeof keyCommand === 'function') {
    return commandOptions;
  }

  if (keyCommand.title) {
    commandOptions.title = keyCommand.title;
  }

  if (keyCommand.priority) {
    commandOptions.priority = keyCommand.priority;
  }

  if (keyCommand.menuName) {
    commandOptions.menuName = keyCommand.menuName;
  }

  return commandOptions;
}

function commandsAreEqual(
  firstCommand: KeyCommand,
  secondCommand: KeyCommand,
): boolean {
  const cmd1 = parseKeyCommand(firstCommand);
  const cdm2 = parseKeyCommand(secondCommand);

  return (
    cmd1.title === cdm2.title &&
    cmd1.menuName === cdm2.menuName &&
    cmd1.priority === cdm2.priority
  );
}

class KeyCommandManager {
  callbacks: CallbackMap = {};

  eventEmitter = new NativeEventEmitter(KeyCommandRegistry);

  constructor() {
    this.eventEmitter.addListener('onKeyCommand', (p: SimpleCommand) =>
      this.onKeyCommand(p),
    );
  }

  onKeyCommand({ command }: SimpleCommand) {
    if (this.callbacks[command]) {
      this.callbacks[command]();
    }
  }

  /**
   * This methods compares previous and current key maps
   * and updates the native side command list only
   * if there was some real changes to the parameters (except callback).
   * Otherwise it will just update the local callback to the command
   *
   * @param keyMap current keymap to regsiter on native side
   * @param prevKeyMap previously registered key commands
   */
  updateCommands(keyMap: KeyMap, prevKeyMap: KeyMap) {
    const commandsToRemove: string[] = [];
    const newCommands: KeyMap = {};

    const allKeys = Object.keys({ ...keyMap, ...prevKeyMap });

    allKeys.forEach((key) => {
      const currentCommand = keyMap[key];
      const prevCommand = prevKeyMap[key];

      if (currentCommand && prevCommand) {
        // Command persisted between updates
        if (commandsAreEqual(currentCommand, prevCommand)) {
          this.callbacks[key] = parseKeyCommand(currentCommand).callback;
          return;
        }

        // If props has changes recreate the command on native side
        commandsToRemove.push(key);
        newCommands[key] = currentCommand;
        return;
      }

      if (currentCommand) {
        newCommands[key] = currentCommand;
        return;
      }

      if (prevCommand) {
        commandsToRemove.push(key);
      }
    });

    if (commandsToRemove.length) {
      KeyCommandRegistry.unregisterCommands(commandsToRemove);

      commandsToRemove.forEach((command) => {
        delete this.callbacks[command];
      });
    }

    if (Object.keys(newCommands).length) {
      const registryCommands: RegistryCommand[] = [];

      Object.entries(newCommands).forEach(([key, command]) => {
        registryCommands.push(buildCommandOptions(key, command));
        this.callbacks[key] = parseKeyCommand(command).callback;
      });

      KeyCommandRegistry.registerCommands(registryCommands);
    }
  }
}

const keyCommandManager = new KeyCommandManager();

export function useKeyCommands(shortcuts: Shortcuts) {
  const keyMap = useMemo(() => {
    const platformName = getCurrentPlatform();
    return createKeyMap(shortcuts, platformName);
  }, [shortcuts]);

  const prevKeyMap = useRef<KeyMap>({});

  useEffect(() => {
    keyCommandManager.updateCommands(keyMap, prevKeyMap.current);

    prevKeyMap.current = keyMap;
  }, [keyMap]);
}
