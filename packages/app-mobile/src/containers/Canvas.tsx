import React, { useCallback, useMemo } from 'react';
import { View, LayoutChangeEvent, GestureResponderEvent } from 'react-native';
import styled from 'styled-components';

import {
  useApplicationState,
  useWorkspace,
  useSelector,
} from 'noya-app-state-context';
import { AffineTransform, Point, createRect } from 'noya-geometry';
import { Selectors, getCurrentPage } from 'noya-state';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import useMultitouchGH, {
  GestureType,
  PanGesture,
  PinchGesture,
} from '../hooks/useMultitouchGH';
import CanvasRenderer from './CanvasRenderer';

function getPoint(event: GestureResponderEvent): Point {
  const { nativeEvent } = event;

  if (nativeEvent.touches.length > 1) {
    const firstTouch = nativeEvent.touches[0];

    return {
      x: firstTouch.locationX,
      y: firstTouch.locationY,
    };
  }

  return {
    x: Math.round(nativeEvent.locationX),
    y: Math.round(nativeEvent.locationY),
  };
}

const Canvas: React.FC<{}> = () => {
  const [state, dispatch] = useApplicationState();
  const { setCanvasSize } = useWorkspace();
  const fontManager = useFontManager();
  const CanvasKit = useCanvasKit();
  const gestures = useMultitouchGH();
  const meta = useSelector(Selectors.getCurrentPageMetadata);

  const insets = useMemo(
    () => ({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }),
    [],
  );

  // Event coordinates are relative to (0,0), but we want them to include
  // the current page's zoom and offset from the origin
  const offsetEventPoint = useCallback(
    (point: Point) =>
      AffineTransform.scale(1 / meta.zoomValue)
        .translate(-meta.scrollOrigin.x, -meta.scrollOrigin.y)
        .applyTo(point),
    [meta],
  );

  const onStartShouldSetResponder = useCallback(
    (e: GestureResponderEvent) => true,
    [],
  );

  const onResponderGrant = useCallback(
    (e: GestureResponderEvent) => {
      const rawPoint = getPoint(e);
      const point = offsetEventPoint(rawPoint);
      gestures.setTouches(e);

      switch (state.interactionState.type) {
        case 'insert': {
          dispatch('interaction', [
            'startDrawing',
            state.interactionState.layerType,
            point,
          ]);

          break;
        }
        case 'none': {
          const layer = Selectors.getLayerAtPoint(
            CanvasKit,
            fontManager,
            state,
            insets,
            point,
            {
              groups: 'groupAndChildren', // event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          const selectedGradientStopIndex =
            Selectors.getGradientStopIndexAtPoint(state, point);

          if (state.selectedGradient && selectedGradientStopIndex !== -1) {
            dispatch('setSelectedGradientStopIndex', selectedGradientStopIndex);

            dispatch('interaction', ['maybeMoveGradientStop', point]);
          } else if (
            state.selectedGradient &&
            Selectors.isPointerOnGradientLine(state, point)
          ) {
            dispatch('addStopToGradient', point);
          } else if (
            state.selectedGradient &&
            Selectors.isPointerOnGradientEllipseEditor(state, point)
          ) {
            dispatch('interaction', ['maybeMoveGradientEllipseLength', point]);
          } else if (layer) {
            if (state.selectedLayerIds.includes(layer.do_objectID)) {
              // if (event.shiftKey && state.selectedLayerIds.length !== 1) {
              // dispatch('selectLayer', layer.do_objectID, 'difference');
              // }
            } else {
              dispatch(
                'selectLayer',
                layer.do_objectID,
                'replace',
                // event.shiftKey ? 'intersection' : 'replace',
              );
            }

            dispatch('interaction', ['maybeMove', point]);
          } else {
            dispatch('selectLayer', undefined);
            dispatch('interaction', ['startMarquee', rawPoint]);
          }

          break;
        }
      }
    },
    [
      state,
      CanvasKit,
      fontManager,
      dispatch,
      insets,
      gestures,
      offsetEventPoint,
    ],
  );

  const onResponderMove = useCallback(
    (e: GestureResponderEvent) => {
      const rawPoint = getPoint(e);
      const point = offsetEventPoint(rawPoint);
      const numOfTouches = e.nativeEvent.touches.length;
      const multiTouchGesture = gestures.getGesture(e);

      switch (state.interactionState.type) {
        case 'insert': {
          dispatch('interaction', [
            state.interactionState.type,
            state.interactionState.layerType,
            point,
          ]);
          break;
        }

        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          break;
        }
        case 'marquee': {
          if (numOfTouches > 1) {
            dispatch('interaction', ['reset']);
            return;
          }

          dispatch('interaction', ['updateMarquee', rawPoint]);

          const { origin, current } = state.interactionState;

          const layers = Selectors.getLayersInRect(
            state,
            getCurrentPage(state),
            insets,
            createRect(origin, current),
            {
              groups: 'groupOnly', // event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          dispatch(
            'selectLayer',
            layers.map((layer) => layer.do_objectID),
          );

          break;
        }
        case 'none': {
          if (numOfTouches <= 1) {
            break;
          }

          if (multiTouchGesture.type === GestureType.Pan) {
            const { deltaX: x, deltaY: y } = multiTouchGesture as PanGesture;
            dispatch('pan*', { x, y });
            break;
          }

          if (multiTouchGesture.type === GestureType.Pinch) {
            const { scale } = multiTouchGesture as PinchGesture;

            if (scale !== 0 || scale !== Infinity) {
              dispatch('setZoom*', scale, 'multiply');
            }

            break;
          }

          break;
        }
      }
    },
    [state, dispatch, gestures, insets, offsetEventPoint],
  );

  const onResponderRelease = useCallback(
    (e: GestureResponderEvent) => {
      const rawPoint = getPoint(e);
      const point = offsetEventPoint(rawPoint);
      gestures.resetTouches();

      switch (state.interactionState.type) {
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          dispatch('addDrawnLayer');

          break;
        }
        case 'marquee': {
          dispatch('interaction', ['reset']);

          const { origin, current } = state.interactionState;

          const layers = Selectors.getLayersInRect(
            state,
            getCurrentPage(state),
            insets,
            createRect(origin, current),
            {
              groups: 'groupOnly', // event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          dispatch(
            'selectLayer',
            layers.map((layer) => layer.do_objectID),
          );

          // containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'none': {
          break;
        }
      }
    },
    [state, dispatch, insets, gestures, offsetEventPoint],
  );

  const onCanvasLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      setCanvasSize({ width, height }, insets);
    },
    [setCanvasSize, insets],
  );

  return (
    <CanvasWrapper
      onStartShouldSetResponder={onStartShouldSetResponder}
      onResponderMove={onResponderMove}
      onResponderGrant={onResponderGrant}
      onResponderRelease={onResponderRelease}
      onLayout={onCanvasLayout}
    >
      <CanvasRenderer />
    </CanvasWrapper>
  );
};

export default React.memo(Canvas);

const CanvasWrapper = styled(View)(() => ({
  flex: 1,
}));
