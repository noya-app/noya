import { useCallback } from 'react';
import type { GestureResponderEvent } from 'react-native';

import { PressableHandler } from './types';

const EventPlaceholder = {
  stopPropagation: () => {},
  preventDefault: () => {},
};

export function usePressableHandler(handler: PressableHandler) {
  return useCallback(
    function usePressableCallback(_event: GestureResponderEvent) {
      handler(EventPlaceholder);
    },
    [handler],
  );
}
