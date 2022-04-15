import React, { useCallback, useState, useMemo } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import styled from 'styled-components';

import {
  useSelector,
  useWorkspace,
  useApplicationState,
} from 'noya-app-state-context';
import { AffineTransform, Point, createRect } from 'noya-geometry';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { ContextMenu } from 'noya-designsystem';
import { Selectors, getCurrentPage } from 'noya-state';
import {
  GestureState,
  useLayerMenu,
  useCanvasGestures,
  TouchCallbackParams,
} from 'noya-workspace-ui';
import CanvasRenderer from './CanvasRenderer';

function isMoving(point: Point, origin: Point): boolean {
  return Math.abs(point.x - origin.x) > 2 || Math.abs(point.y - origin.y) > 2;
}

const Canvas: React.FC<{}> = () => {
  const [appState, dispatch] = useApplicationState();
  const { setCanvasSize } = useWorkspace();
  const fontManager = useFontManager();
  const CanvasKit = useCanvasKit();

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const meta = useSelector(Selectors.getCurrentPageMetadata);

  const [menuItems, onSelectMenuItem] = useLayerMenu(
    selectedLayers,
    appState.interactionState.type,
  );

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

  const onTouchStart = useCallback(
    ({ point: rawPoint, state }: TouchCallbackParams) => {
      const point = offsetEventPoint(rawPoint);

      switch (appState.interactionState.type) {
        case 'insert': {
          dispatch('interaction', [
            'startDrawing',
            appState.interactionState.layerType,
            point,
          ]);
          break;
        }
        case 'none': {
          const layer = Selectors.getLayerAtPoint(
            CanvasKit,
            fontManager,
            appState,
            insets,
            rawPoint,
            {
              groups: 'groupAndChildren', // event[modKey] ? 'childrenOnly' : 'groupOnly',
              artboards: 'emptyOrContainedArtboardOrChildren',
              includeLockedLayers: false,
            },
          );

          const selectedGradientStopIndex =
            Selectors.getGradientStopIndexAtPoint(appState, point);

          if (appState.selectedGradient && selectedGradientStopIndex !== -1) {
            dispatch('setSelectedGradientStopIndex', selectedGradientStopIndex);

            dispatch('interaction', ['maybeMoveGradientStop', point]);
          } else if (
            appState.selectedGradient &&
            Selectors.isPointerOnGradientLine(appState, point)
          ) {
            dispatch('addStopToGradient', point);
          } else if (
            appState.selectedGradient &&
            Selectors.isPointerOnGradientEllipseEditor(appState, point)
          ) {
            dispatch('interaction', ['maybeMoveGradientEllipseLength', point]);
          } else if (layer) {
            if (appState.selectedLayerIds.includes(layer.do_objectID)) {
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
    [offsetEventPoint, CanvasKit, fontManager, appState, dispatch, insets],
  );

  const onTouchUpdate = useCallback(
    ({
      point: rawPoint,
      delta,
      scale,
      scaleTo,
      state,
      touches,
    }: TouchCallbackParams) => {
      const point = offsetEventPoint(rawPoint);

      if (state === GestureState.Undetermined) {
        return;
      }

      if (state === GestureState.Canvas) {
        dispatch('panAndZoom*', { scale, scaleTo, delta });
        return;
      }

      switch (appState.interactionState.type) {
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          break;
        }
        case 'insert': {
          dispatch('interaction', [
            appState.interactionState.type,
            appState.interactionState.layerType,
            point,
          ]);
          break;
        }
        case 'maybeMove':
        case 'maybeScale': {
          const { origin } = appState.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', [
              appState.interactionState.type === 'maybeMove'
                ? 'updateMoving'
                : 'updateScaling',
              point,
            ]);
          }

          break;
        }
        case 'maybeMoveControlPoint': {
          const { origin } = appState.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingControlPoint', origin, point]);
          }
          break;
        }
        case 'movingControlPoint': {
          const { origin } = appState.interactionState;

          dispatch('interaction', ['updateMovingControlPoint', origin, point]);

          break;
        }
        case 'moving':
        case 'scaling': {
          dispatch('interaction', [
            appState.interactionState.type === 'moving'
              ? 'updateMoving'
              : 'updateScaling',
            point,
          ]);

          break;
        }

        case 'marquee': {
          dispatch('interaction', ['updateMarquee', rawPoint]);

          const { origin, current } = appState.interactionState;

          const layers = Selectors.getLayersInRect(
            appState,
            getCurrentPage(appState),
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
      }
    },
    [offsetEventPoint, appState, dispatch, insets],
  );

  const onTouchEnd = useCallback(
    ({ point: rawPoint, state }: TouchCallbackParams) => {
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
        case 'marquee': {
          dispatch('interaction', ['reset']);

          const { origin, current } = appState.interactionState;

          const layers = Selectors.getLayersInRect(
            appState,
            getCurrentPage(appState),
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
        case 'maybeMove':
        case 'maybeScale':
        case 'moveGradientStop':
        case 'maybeMoveGradientStop':
        case 'maybeMoveGradientEllipseLength':
        case 'moveGradientEllipseLength': {
          dispatch('interaction', ['reset']);

          break;
        }
        case 'moving':
        case 'scaling': {
          dispatch('interaction', [
            appState.interactionState.type === 'moving'
              ? 'updateMoving'
              : 'updateScaling',
            point,
          ]);

          if (appState.interactionState.type === 'moving')
            dispatch('moveLayersIntoParentAtPoint', point);

          dispatch('interaction', ['reset']);

          break;
        }
        case 'maybeMoveControlPoint':
        case 'movingControlPoint':
        case 'maybeMovePoint':
        case 'movingPoint': {
          dispatch('interaction', ['resetEditPath', point]);
          break;
        }
      }
    },
    [offsetEventPoint, appState, dispatch, insets],
  );

  const gestures = useCanvasGestures(onTouchStart, onTouchUpdate, onTouchEnd);

  const onCanvasLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      setCanvasSize({ width, height }, insets);
    },
    [setCanvasSize, insets],
  );

  return (
    <ContextMenu items={menuItems} onSelect={onSelectMenuItem}>
      <GestureDetector gesture={gestures}>
        <CanvasWrapper onLayout={onCanvasLayout}>
          <CanvasRenderer />
        </CanvasWrapper>
      </GestureDetector>
    </ContextMenu>
  );
};

export default React.memo(Canvas);

const CanvasWrapper = styled(View)({
  flex: 1,
});
