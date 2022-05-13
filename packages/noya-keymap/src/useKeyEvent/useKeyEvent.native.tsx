import { useRef, useState, useEffect, useCallback } from 'react';
import { NativeEventEmitter, NativeModule, NativeModules } from 'react-native';

import { keyCodeToKeyNames, KeyCode, KeyName } from './utils';

interface KeyEvent {
  nativeKeyCode: KeyCode;
}

type KeyMap = Record<string, boolean>;

const { KeyEventEmitter } = NativeModules as {
  KeyEventEmitter: NativeModule;
};

const eventEmitter = new NativeEventEmitter(KeyEventEmitter);

function parseKeyCode(keyCode: KeyCode, enabled: boolean): KeyMap {
  const names = keyCodeToKeyNames(keyCode);
  const keyMap: KeyMap = {};

  names.forEach((keyName) => {
    keyMap[keyName] = enabled;
  });

  return keyMap;
}

export function useKeyEvent() {
  const [pressedKeys, setPressedKeys] = useState<KeyMap>({});
  const pressedKeysRef = useRef<KeyMap>(pressedKeys);

  useEffect(() => {
    pressedKeysRef.current = pressedKeys;
  }, [pressedKeys]);

  const onKeyDown = useCallback((event: KeyEvent) => {
    setPressedKeys({
      ...pressedKeysRef.current,
      ...parseKeyCode(event.nativeKeyCode, true),
    });
  }, []);

  const onKeyUp = useCallback((event: KeyEvent) => {
    setPressedKeys({
      ...pressedKeysRef.current,
      ...parseKeyCode(event.nativeKeyCode, false),
    });
  }, []);

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
  }, []);
}
