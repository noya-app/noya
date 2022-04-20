import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

import {
  TouchHistory,
  getTouchFeatures,
  getInitialHistory,
  TouchMoveThreshold,
} from 'noya-designsystem';
import { GestureState, CanvasTouchCallback } from './types';

export default function useCanvasGestures(
  onTouchStart: CanvasTouchCallback,
  onTouchUpdate: CanvasTouchCallback,
  onTouchEnd: CanvasTouchCallback,
) {
  const isActive = useSharedValue(false);
  const gestureState = useSharedValue<GestureState>(GestureState.Undetermined);
  const history = useSharedValue<TouchHistory>({
    touches: {},
    numberOfTouches: 0,
    centroid: { x: 0, y: 0 },
    pinchIds: [0, 0],
  });

  const gesture = Gesture.Manual()
    .runOnJS(true)
    .onTouchesDown((event) => {
      if (
        event.numberOfTouches > 1 &&
        gestureState.value === GestureState.Undetermined
      ) {
        gestureState.value = GestureState.Canvas;
      }

      history.value = getInitialHistory(event.allTouches);

      if (!isActive.value) {
        isActive.value = true;

        onTouchStart({
          scale: 1,
          point: {
            x: event.allTouches[0].x,
            y: event.allTouches[0].y,
          },
          delta: { x: 0, y: 0 },
          scaleTo: {
            x: event.allTouches[0].x,
            y: event.allTouches[0].y,
          },
          state: gestureState.value,
        });
      }
    })
    .onTouchesMove((event) => {
      if (!isActive.value || event.numberOfTouches === 0) {
        return;
      }

      const [features, touch] = getTouchFeatures(
        event.allTouches,
        history.value,
      );
      history.value = touch;

      if (
        gestureState.value === GestureState.Undetermined &&
        features.distance > TouchMoveThreshold
      ) {
        gestureState.value = GestureState.Other;
      } else {
        onTouchUpdate({
          ...features,
          state: gestureState.value,
        });
      }
    })
    .onTouchesUp((event) => {
      if (event.numberOfTouches < 1) {
        isActive.value = false;
        onTouchEnd({
          scale: 1,
          point: history.value.centroid,
          scaleTo: history.value.centroid,
          delta: { x: 0, y: 0 },
          state: gestureState.value,
        });

        gestureState.value = GestureState.Undetermined;
        history.value = {
          touches: {},
          numberOfTouches: 0,
          centroid: { x: 0, y: 0 },
          pinchIds: [0, 0],
        };
      } else {
        const [, touch] = getTouchFeatures(event.allTouches, history.value);
        history.value = touch;
      }
    });

  return gesture;
}
