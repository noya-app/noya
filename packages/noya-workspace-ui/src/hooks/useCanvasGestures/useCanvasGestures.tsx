import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

import {
  getFeatures,
  TouchHistory,
  GestureState,
  MoveThreshold,
  CallbackParams,
  getInitialHistory,
} from './utils';

type Callback = (params: CallbackParams) => void;

export default function useCanvasGestures(
  onTouchStart: Callback,
  onTouchUpdate: Callback,
  onTouchEnd: Callback,
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
    .onTouchesDown((event, manager) => {
      if (
        event.numberOfTouches > 1 &&
        gestureState.value === GestureState.Undetermined
      ) {
        gestureState.value = GestureState.Canvas;
      }

      history.value = getInitialHistory(event.allTouches);

      if (!isActive.value) {
        manager.activate();

        runOnJS(onTouchStart)({
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
          touches: event.allTouches,
        });
      }
    })
    .onTouchesMove((event) => {
      if (!isActive.value || event.numberOfTouches === 0) {
        return;
      }

      const [features, touch] = getFeatures(event.allTouches, history.value);
      history.value = touch;

      if (
        gestureState.value === GestureState.Undetermined &&
        features.distance > MoveThreshold
      ) {
        gestureState.value = GestureState.Other;
        runOnJS(onTouchStart)({
          ...features,
          delta: { x: 0, y: 0 },
          scale: 1,
          state: gestureState.value,
          touches: event.allTouches,
        });
      } else {
        runOnJS(onTouchUpdate)({
          ...features,
          state: gestureState.value,
          touches: event.allTouches,
        });
      }
    })
    .onTouchesUp((event, manager) => {
      if (event.numberOfTouches < 1) {
        runOnJS(onTouchEnd)({
          scale: 1,
          point: history.value.centroid,
          scaleTo: history.value.centroid,
          delta: { x: 0, y: 0 },
          state: gestureState.value,
          touches: event.allTouches,
        });
        manager.end();
      } else {
        const [, touch] = getFeatures(event.allTouches, history.value);
        history.value = touch;
      }
    })
    .onStart(() => {
      isActive.value = true;
    })
    .onEnd(() => {
      gestureState.value = GestureState.Undetermined;
      history.value = {
        touches: {},
        numberOfTouches: 0,
        centroid: { x: 0, y: 0 },
        pinchIds: [0, 0],
      };
      isActive.value = false;
    });

  return gesture;
}
