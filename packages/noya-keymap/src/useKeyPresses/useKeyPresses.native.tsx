import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  NativeEventEmitter,
  NativeModule,
  NativeModules,
  Platform,
} from 'react-native';

import { createKeyMap } from '../utils/createKeyMap';
import { keyCodeToKeyNames, KeyCode } from './utils.native';
import {
  Shortcuts,
  PressesMap,
  PlatformName,
  KeyCommandOptions,
} from '../types';
import { parseKeyCommand } from '../utils/parseKeyCommand';

interface KeyEvent {
  nativeKeyCode: KeyCode;
}

const { KeyEventEmitter } = NativeModules as {
  KeyEventEmitter: NativeModule;
};

const eventEmitter = new NativeEventEmitter(KeyEventEmitter);

function parseKeyCode(keyCode: KeyCode, enabled: boolean): PressesMap {
  const names = keyCodeToKeyNames(keyCode);
  const keyMap: PressesMap = {};

  names.forEach((keyName) => {
    keyMap[keyName] = enabled;
  });

  return keyMap;
}

export function useKeyPresses(
  shortcuts: Shortcuts,
  options: KeyCommandOptions = { eventName: 'keydown' },
): PressesMap {
  const { eventName } = options;
  const [pressedKeys, setPressedKeys] = useState<PressesMap>({});
  const pressedKeysRef = useRef<PressesMap>(pressedKeys);

  const keyMap = useMemo(
    () => createKeyMap(shortcuts, Platform.OS as PlatformName),
    [shortcuts],
  );

  const keyMapRef = useRef(keyMap);

  useEffect(() => {
    keyMapRef.current = keyMap;
  }, [keyMap]);

  useEffect(() => {
    pressedKeysRef.current = pressedKeys;
  }, [pressedKeys]);

  const onKeyDown = useCallback(
    (event: KeyEvent) => {
      const presses = parseKeyCode(event.nativeKeyCode, true);

      if (eventName === 'keydown') {
        Object.entries(keyMapRef.current).forEach(([keyName, keyCommand]) => {
          if (keyName in presses) {
            parseKeyCommand(keyCommand).callback();
          }
        });
      }

      setPressedKeys({
        ...pressedKeysRef.current,
        ...presses,
      });
    },
    [eventName],
  );

  const onKeyUp = useCallback(
    (event: KeyEvent) => {
      const presses = parseKeyCode(event.nativeKeyCode, false);

      if (eventName === 'keyup') {
        Object.entries(keyMapRef.current).forEach(([keyName, keyCommand]) => {
          if (keyName in presses) {
            parseKeyCommand(keyCommand).callback();
          }
        });
      }

      setPressedKeys({
        ...pressedKeysRef.current,
        ...presses,
      });
    },
    [eventName],
  );

  useEffect(() => {
    const keyDownSubscription = eventEmitter.addListener(
      'onKeyDown',
      onKeyDown,
    );
    const keyUpSubscription = eventEmitter.addListener('onKeyUp', onKeyUp);

    return () => {
      keyDownSubscription.remove();
      keyUpSubscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);

  return pressedKeys;
}
