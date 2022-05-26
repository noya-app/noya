import { useState } from 'react';
import { PressesMap, Shortcuts, KeyCommandOptions } from '../types';

export function useKeyPresses(
  shortcuts: Shortcuts,
  options: KeyCommandOptions = { eventName: 'keydown' },
): PressesMap {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pressedKeys, _setPressedKeys] = useState<PressesMap>({});

  return pressedKeys;
}
