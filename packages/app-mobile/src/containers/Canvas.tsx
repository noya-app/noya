import React, { useCallback, useMemo } from 'react';
import { LayoutChangeEvent } from 'react-native';
import styled from 'styled-components';

import {
  useApplicationState,
  useWorkspace,
  useSelector,
} from 'noya-app-state-context';
import {
  Touchable,
  ContextMenu,
  Gesture,
  GestureType,
} from 'noya-designsystem';
import { AffineTransform, Point, createRect } from 'noya-geometry';
import { Selectors, getCurrentPage } from 'noya-state';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import CanvasRenderer from './CanvasRenderer';
import { useLayerMenu } from 'noya-workspace-ui';

function isMoving(point: Point, origin: Point): boolean {
  return Math.abs(point.x - origin.x) > 2 || Math.abs(point.y - origin.y) > 2;
}

const Canvas: React.FC<{}> = () => {
  const meta = useSelector(Selectors.getCurrentPageMetadata);
  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const [state, dispatch] = useApplicationState();
  const { setCanvasSize } = useWorkspace();
  const fontManager = useFontManager();
  const CanvasKit = useCanvasKit();

  const [menuItems, onSelectMenuItem] = useLayerMenu(
    selectedLayers,
    state.interactionState.type,
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
    (params: Gesture) => {
      const rawPoint = params.point;
      const point = offsetEventPoint(rawPoint);

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
            rawPoint,
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
    [state, CanvasKit, fontManager, dispatch, insets, offsetEventPoint],
  );

  const onTouchUpdate = useCallback(
    (params: Gesture) => {
      const rawPoint = params.point;
      const point = offsetEventPoint(rawPoint);

      switch (state.interactionState.type) {
        case 'insert': {
          dispatch('interaction', [
            state.interactionState.type,
            state.interactionState.layerType,
            point,
          ]);
          break;
        }
        case 'maybeMove':
        case 'maybeScale': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', [
              state.interactionState.type === 'maybeMove'
                ? 'updateMoving'
                : 'updateScaling',
              point,
            ]);
          }

          break;
        }
        case 'maybeMoveControlPoint': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingControlPoint', origin, point]);
          }
          break;
        }
        case 'movingControlPoint': {
          const { origin } = state.interactionState;

          dispatch('interaction', ['updateMovingControlPoint', origin, point]);

          break;
        }

        case 'moving':
        case 'scaling': {
          dispatch('interaction', [
            state.interactionState.type === 'moving'
              ? 'updateMoving'
              : 'updateScaling',
            point,
          ]);

          break;
        }

        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          break;
        }
        case 'marquee': {
          if (params.numOfPointers > 1) {
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
          if (params.numOfPointers > 1) {
            if (params.type === GestureType.Pinch) {
              dispatch('setZoom*', params.scale!, 'multiply');
              break;
            }

            if (params.type === GestureType.Pan) {
              dispatch('pan*', params.delta!);
            }
          }

          break;
        }
      }
    },
    [state, dispatch, insets, offsetEventPoint],
  );

  const onTouchEnd = useCallback(
    (params: Gesture) => {
      const rawPoint = params.point;
      const point = offsetEventPoint(rawPoint);

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
            state.interactionState.type === 'moving'
              ? 'updateMoving'
              : 'updateScaling',
            point,
          ]);

          if (state.interactionState.type === 'moving')
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
        case 'none': {
          break;
        }
      }
    },
    [state, dispatch, insets, offsetEventPoint],
  );

  const onCanvasLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      setCanvasSize({ width, height }, insets);
    },
    [setCanvasSize, insets],
  );

  return (
    <ContextMenu items={menuItems} onSelect={onSelectMenuItem}>
      <CanvasWrapper
        onLayout={onCanvasLayout}
        onTouchStart={onTouchStart}
        onTouchUpdate={onTouchUpdate}
        onTouchEnd={onTouchEnd}
      >
        <CanvasRenderer />
      </CanvasWrapper>
    </ContextMenu>
  );
};

export default React.memo(Canvas);

const CanvasWrapper = styled(Touchable)(() => ({
  flex: 1,
}));
