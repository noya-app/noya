import { runOnJS, SharedValue, useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureType } from 'react-native-gesture-handler';

import { Position } from '../types';

export interface TapGesture {
  gesture: GestureType;
  position: SharedValue<{ x: number; y: number }>;
  // SharedValue type for effect dependencies doesn't really matter
  effectDeps: SharedValue<any>[];
}

export interface TapParams {
  position: Position;
}

interface Params {
  onGestureFinished?: (params: TapParams) => void;
}

export default function useTapGesture({ onGestureFinished }: Params = {}) {
  const position = useSharedValue({ x: 0, y: 0 });

  const gesture = Gesture.Tap().onEnd((e, success) => {
    if (!success) {
      return;
    }

    position.value = {
      x: e.x,
      y: e.y,
    };

    if (onGestureFinished) {
      runOnJS(onGestureFinished)({ position: position.value });
    }
  });

  return {
    gesture,
    position,
    effectDeps: [position],
  };
}
