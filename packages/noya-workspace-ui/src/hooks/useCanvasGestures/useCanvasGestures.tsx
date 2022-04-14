import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';

import { Selectors } from 'noya-state';
import { AffineTransform, Point } from 'noya-geometry';
import { useSelector, useApplicationState } from 'noya-app-state-context';
import {
  getTouchMap,
  getFeatures,
  TouchHistory,
  GestureState,
  CallbackParams,
} from './utils';

const MoveThreshold = 15;

export default function useCanvasGestures() {
  const [appState, dispatch] = useApplicationState();
  const meta = useSelector(Selectors.getCurrentPageMetadata);
  const isActive = useSharedValue(false);
  const gestureState = useSharedValue<GestureState>(GestureState.Undetermined);
  const history = useSharedValue<TouchHistory>({
    touches: {},
    numberOfTouches: 0,
    pinchLastIds: [0, 0],
    panLastId: 0,
  });

  // Event coordinates are relative to (0,0), but we want them to include
  // the current page's zoom and offset from the origin
  const offsetEventPoint = useCallback(
    (point: Point) =>
      AffineTransform.scale(1 / meta.zoomValue)
        .translate(-meta.scrollOrigin.x, -meta.scrollOrigin.y)
        .applyTo(point),
    [meta],
  );

  const onTouchStart = useCallback(
    ({ x, y, state }: CallbackParams) => {
      const rawPoint = { x, y };
      const point = offsetEventPoint(rawPoint);

      if (state !== GestureState.Other) {
        return;
      }

      switch (appState.interactionState.type) {
        case 'insert': {
          dispatch('interaction', [
            'startDrawing',
            appState.interactionState.layerType,
            point,
          ]);
        }
      }
    },
    [offsetEventPoint, appState, dispatch],
  );

  const onTouchUpdate = useCallback(
    ({ x, y, delta, scale, center, state }: CallbackParams) => {
      const rawPoint = { x, y };
      const point = offsetEventPoint(rawPoint);

      if (state === GestureState.Undetermined) {
        return;
      }

      if (state === GestureState.Canvas) {
        dispatch('panAndZoom*', { scale, scaleTo: center, delta });
        return;
      }

      switch (appState.interactionState.type) {
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          break;
        }
      }
    },
    [offsetEventPoint, appState, dispatch],
  );

  const onTouchEnd = useCallback(
    ({ x, y, state }: CallbackParams) => {
      const rawPoint = { x, y };
      const point = offsetEventPoint(rawPoint);

      if (state !== GestureState.Other) {
        return;
      }

      switch (appState.interactionState.type) {
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          dispatch('addDrawnLayer');
          break;
        }
      }
    },
    [offsetEventPoint, appState, dispatch],
  );

  const gesture = Gesture.Manual()
    .onTouchesDown((event, manager) => {
      if (
        event.numberOfTouches > 1 &&
        gestureState.value === GestureState.Undetermined
      ) {
        gestureState.value = GestureState.Canvas;
      }

      history.value = {
        numberOfTouches: event.numberOfTouches,
        touches: getTouchMap(event.allTouches),
        panLastId: 0,
        pinchLastIds: [0, 1],
      };

      if (!isActive.value) {
        manager.activate();

        runOnJS(onTouchStart)({
          scale: 1,
          x: event.allTouches[0].x,
          y: event.allTouches[0].y,
          delta: { x: 0, y: 0 },
          center: {
            x: event.allTouches[0].x,
            y: event.allTouches[0].y,
          },
          state: gestureState.value,
        });
      }
    })
    .onTouchesMove((event) => {
      if (!isActive.value) {
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
        });
      } else {
        runOnJS(onTouchUpdate)({
          ...features,
          state: gestureState.value,
        });
      }
    })
    .onTouchesUp((event, manager) => {
      const [features, touch] = getFeatures(event.allTouches, history.value);
      history.value = touch;

      if (event.numberOfTouches < 1) {
        runOnJS(onTouchEnd)({
          ...features,
          state: gestureState.value,
        });
        manager.end();
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
        pinchLastIds: [0, 0],
        panLastId: 0,
      };
      isActive.value = false;
    });

  return gesture;
}
