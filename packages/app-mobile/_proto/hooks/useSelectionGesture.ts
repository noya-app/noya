import { useSharedValue, runOnJS, SharedValue } from 'react-native-reanimated';
import { Gesture, GestureType } from 'react-native-gesture-handler';

import { Position, Size } from '../types';

export interface SelectionParams {
  position: Position;
  size: Size;
}

export interface SelectionGesture {
  gesture: GestureType;
  size: SharedValue<{ width: number; height: number }>;
  position: SharedValue<{ x: number; y: number }>;
  // SharedValue type for effect dependencies doesn't really matter
  effectDeps: SharedValue<any>[];
}

interface Params {
  onGestureFinished?: (params: SelectionParams) => void;
}

export default function useSelectionGesture({
  onGestureFinished,
}: Params = {}): SelectionGesture {
  const position = useSharedValue({ x: 0, y: 0 });
  const size = useSharedValue({ width: 0, height: 0 });

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      position.value = {
        x: e.x,
        y: e.y,
      };
      size.value = {
        width: 0,
        height: 0,
      };
    })
    .onUpdate((e) => {
      size.value = {
        width: e.x - position.value.x,
        height: e.y - position.value.y,
      };
    })
    .onFinalize((_e, success) => {
      if (!success) {
        return;
      }

      if (onGestureFinished) {
        runOnJS(onGestureFinished)({
          position: position.value,
          size: size.value,
        });
      }

      position.value = {
        x: 0,
        y: 0,
      };

      size.value = {
        width: 0,
        height: 0,
      };
    });

  return {
    gesture,
    size: size,
    position: position,
    effectDeps: [position, size],
  };
}
