import type { KeyCommand, RichKeyCommand } from '../types';

export function parseKeyCommand(command: KeyCommand): RichKeyCommand {
  if (typeof command === 'function') {
    return {
      callback: command,
    };
  }

  return command;
}
