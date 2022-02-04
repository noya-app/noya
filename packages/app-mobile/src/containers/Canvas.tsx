import React, { useCallback, useMemo, useRef } from 'react';
import { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import styled from 'styled-components';

import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import { Point, createRect } from 'noya-geometry';
import { Selectors, getCurrentPage } from 'noya-state';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { FpsCounter } from '../components/FPSCounter';
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
  const canvasKit = useCanvasKit();
  const touchRef = useRef<Point>({ x: 0, y: 0 });

  const insets = useMemo(
    () => ({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }),
    [],
  );

  const onStartShouldSetResponder = useCallback(
    (e: GestureResponderEvent) => true,
    [],
  );

  const onResponderGrant = useCallback(
    (e: GestureResponderEvent) => {
      const numOfTouches = e.nativeEvent.touches.length;
      const rawPoint = getPoint(e);

      switch (state.interactionState.type) {
        case 'insert': {
          dispatch('interaction', [
            'startDrawing',
            state.interactionState.layerType,
            rawPoint,
          ]);

          break;
        }
        case 'none': {
          if (numOfTouches > 1) {
            touchRef.current = rawPoint;
            return;
          }

          const layer = Selectors.getLayerAtPoint(
            canvasKit,
            fontManager,
            state,
            insets,
            rawPoint,
            {
              groups: 'groupAndChildren', // event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          const selectedGradientStopIndex =
            Selectors.getGradientStopIndexAtPoint(state, rawPoint);

          if (state.selectedGradient && selectedGradientStopIndex !== -1) {
            dispatch('setSelectedGradientStopIndex', selectedGradientStopIndex);

            dispatch('interaction', ['maybeMoveGradientStop', rawPoint]);
          } else if (
            state.selectedGradient &&
            Selectors.isPointerOnGradientLine(state, rawPoint)
          ) {
            dispatch('addStopToGradient', rawPoint);
          } else if (
            state.selectedGradient &&
            Selectors.isPointerOnGradientEllipseEditor(state, rawPoint)
          ) {
            dispatch('interaction', [
              'maybeMoveGradientEllipseLength',
              rawPoint,
            ]);
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

            dispatch('interaction', ['maybeMove', rawPoint]);
          } else {
            dispatch('selectLayer', undefined);
            dispatch('interaction', ['startMarquee', rawPoint]);
          }

          break;
        }
      }
    },
    [state, canvasKit, fontManager, dispatch, insets],
  );

  const onResponderMove = useCallback(
    (e: GestureResponderEvent) => {
      const rawPoint = getPoint(e);
      const numOfTouches = e.nativeEvent.touches.length;

      switch (state.interactionState.type) {
        case 'insert': {
          dispatch('interaction', [
            state.interactionState.type,
            state.interactionState.layerType,
            rawPoint,
          ]);
          break;
        }

        case 'drawing': {
          dispatch('interaction', ['updateDrawing', rawPoint]);
          break;
        }
        case 'marquee': {
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
          if (numOfTouches > 1) {
            const deltaX = touchRef.current.x - rawPoint.x;
            const deltaY = touchRef.current.y - rawPoint.y;

            dispatch('pan*', { x: deltaX, y: deltaY });
            touchRef.current = rawPoint;
          }

          break;
        }
      }
    },
    [state, dispatch, insets],
  );

  const onResponderRelease = useCallback(
    (e: GestureResponderEvent) => {
      const rawPoint = getPoint(e);

      switch (state.interactionState.type) {
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', rawPoint]);
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
          touchRef.current = { x: 0, y: 0 };
          break;
        }
      }
    },
    [state, dispatch, insets],
  );

  const onCanvasLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      setCanvasSize({ width, height }, insets);
    },
    [setCanvasSize, insets],
  );

  const interactionView = useMemo(
    () => (
      <InteractionView>
        <FpsCounter visible />
        <Interaction>{state.interactionState.type}</Interaction>
      </InteractionView>
    ),
    [state.interactionState.type],
  );

  return (
    <CanvasWrapper
      onStartShouldSetResponder={onStartShouldSetResponder}
      onResponderMove={onResponderMove}
      onResponderGrant={onResponderGrant}
      onResponderRelease={onResponderRelease}
      onLayout={onCanvasLayout}
    >
      {interactionView}
      <CanvasRenderer />
    </CanvasWrapper>
  );
};

export default React.memo(Canvas);

const CanvasWrapper = styled.View(() => ({
  flex: 1,
}));

const InteractionView = styled.View((p) => ({
  zIndex: 10,
  width: '50%',
  position: 'absolute',
  backgroundColor: p.theme.colors.neutralBackground,
  padding: p.theme.sizes.spacing.small,
}));

const Interaction = styled.Text((p) => ({
  color: p.theme.colors.text,
  fontSize: 14,
  textTransform: 'uppercase',
}));
