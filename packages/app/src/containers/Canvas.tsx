import { ContextMenu } from 'noya-designsystem';
import { createRect, Insets } from 'noya-geometry';
import { useKeyboardShortcuts } from 'noya-keymap';
import { useCanvasKit, uuid } from 'noya-renderer';
import { decodeCurvePoint } from 'noya-renderer/src/primitives';
import {
  CompassDirection,
  Layers,
  Point,
  SelectedControlPoint,
  Selectors,
  ShapeType,
} from 'noya-state';
import { SelectedPoint } from 'noya-state/src/reducers/pointReducer';
import {
  canClosePath,
  getCursorForEditPathMode,
} from 'noya-state/src/selectors/elementSelectors';
import { getBoundingRectMap } from 'noya-state/src/selectors/geometrySelectors';
import { getSelectedLayers } from 'noya-state/src/selectors/layerSelectors';
import { getCurrentPage } from 'noya-state/src/selectors/pageSelectors';
import {
  getIsEditingPath,
  isPointInRange,
} from 'noya-state/src/selectors/pointSelectors';
import {
  CSSProperties,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import styled, { useTheme } from 'styled-components';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useLayerMenu from '../hooks/useLayerMenu';
import { useSize } from '../hooks/useSize';
import { useWorkspace } from '../hooks/useWorkspace';
import * as MouseEvent from '../utils/mouseEvent';
import CanvasKitRenderer from './renderer/CanvasKitRenderer';

const InsetContainer = styled.div<{ insets: Insets }>(({ insets }) => ({
  position: 'absolute',
  top: -insets.top,
  bottom: -insets.bottom,
  right: -insets.right,
  left: -insets.left,
  zIndex: -1,
}));

function getCursorForDirection(
  direction: CompassDirection,
): CSSProperties['cursor'] {
  switch (direction) {
    case 'e':
    case 'w':
      return 'ew-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'nw':
    case 'se':
      return 'nwse-resize';
  }
}

function getPoint(event: MouseEvent): Point {
  return { x: Math.round(event.offsetX), y: Math.round(event.offsetY) };
}

function isMoving(point: Point, origin: Point): boolean {
  return Math.abs(point.x - origin.x) > 2 || Math.abs(point.y - origin.y) > 2;
}
const Container = styled.div<{ cursor: CSSProperties['cursor'] }>(
  ({ cursor }) => ({
    flex: '1',
    position: 'relative',
    cursor,
  }),
);

export default memo(function Canvas() {
  const theme = useTheme();
  const {
    sizes: { sidebarWidth },
  } = theme;
  const [state, dispatch] = useApplicationState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const CanvasKit = useCanvasKit();
  const containerSize = useSize(containerRef);
  const meta = useSelector(Selectors.getCurrentPageMetadata);
  const { setCanvasSize, highlightLayer, highlightedLayer } = useWorkspace();

  const isEditingPath = getIsEditingPath(state.interactionState.type);
  const nudge = (axis: 'X' | 'Y', amount: number) => {
    if (isEditingPath && state.selectedControlPoint) {
      dispatch(`setControlPoint${axis}` as const, amount, 'adjust');
    } else {
      dispatch(
        isEditingPath
          ? (`setPoint${axis}` as const)
          : (`setLayer${axis}` as const),
        amount,
        'adjust',
      );
    }
  };

  useKeyboardShortcuts({
    ArrowLeft: () => nudge('X', -1),
    ArrowRight: () => nudge('X', 1),
    ArrowUp: () => nudge('Y', -1),
    ArrowDown: () => nudge('Y', 1),
    'Shift-ArrowLeft': () => nudge('X', -10),
    'Shift-ArrowRight': () => nudge('X', 10),
    'Shift-ArrowUp': () => nudge('Y', -10),
    'Shift-ArrowDown': () => nudge('Y', 10),
    Backspace: () => dispatch('deleteLayer', state.selectedObjects),
    Escape: () => dispatch('interaction', ['reset']),
    Shift: () => dispatch('setKeyModifier', 'shiftKey', true),
  });

  useKeyboardShortcuts('keyup', {
    Shift: () => dispatch('setKeyModifier', 'shiftKey', false),
  });

  const insets = useMemo(
    () => ({
      left: sidebarWidth,
      right: sidebarWidth,
      top: 0,
      bottom: 0,
    }),
    [sidebarWidth],
  );

  // Update the canvas size whenever the window is resized
  useLayoutEffect(() => {
    if (!containerSize) return;

    setCanvasSize(containerSize, insets);
  }, [insets, setCanvasSize, containerSize]);

  const visibleCanvasSize = useMemo(
    () => containerSize ?? { width: 0, height: 0 },
    [containerSize],
  );

  const canvasSizeWithInsets = useMemo(
    () =>
      containerSize && containerSize.width > 0 && containerSize.height > 0
        ? {
            width: containerSize.width + insets.left + insets.right,
            height: containerSize.height,
          }
        : undefined,
    [containerSize, insets.left, insets.right],
  );

  // Event coordinates are relative to (0,0), but we want them to include
  // the current document's offset from the origin
  const offsetEventPoint = useCallback(
    (point: Point) => {
      return {
        x: point.x - meta.scrollOrigin.x,
        y: point.y - meta.scrollOrigin.y,
      };
    },
    [meta],
  );

  const selectedLayers = useSelector(Selectors.getSelectedLayers);
  const [menuItems, onSelectMenuItem] = useLayerMenu(selectedLayers);

  const handleMouseDown = useCallback(
    (event: React.PointerEvent) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      if (MouseEvent.isRightButtonClicked(event)) {
        const layer = Selectors.getLayerAtPoint(
          CanvasKit,
          state,
          insets,
          rawPoint,
          {
            clickThroughGroups: event.metaKey,
            includeHiddenLayers: false,
            includeArtboardLayers: false,
          },
        );

        if (!layer) {
          dispatch('selectLayer', undefined);
        } else if (!state.selectedObjects.includes(layer.do_objectID)) {
          dispatch('selectLayer', layer.do_objectID);
        }

        return;
      }

      if (!MouseEvent.isLeftButtonClicked(event)) return;

      switch (state.interactionState.type) {
        case 'insertArtboard':
        case 'insertRectangle':
        case 'insertOval':
        case 'insertText': {
          const id = uuid();

          dispatch('interaction', [
            'startDrawing',
            state.interactionState.type.slice(6).toLowerCase() as ShapeType,
            id,
            point,
          ]);

          break;
        }
        case 'panMode': {
          dispatch('interaction', ['maybePan', rawPoint]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'drawingShapePath': {
          dispatch('addShapePathLayer', point);
          dispatch('interaction', ['editPath']);
          //  dispatch('interaction', ['maybeMoveControlPoint', point]);
          break;
        }
        case 'editPath': {
          const { shiftKey } = state.keyModifiers;
          let selectedPoint: SelectedPoint | undefined = undefined;
          let selectedControlPoint: SelectedControlPoint | undefined;

          const boundingRects = getBoundingRectMap(
            getCurrentPage(state),
            state.selectedObjects,
            {
              clickThroughGroups: true,
              includeArtboardLayers: false,
              includeHiddenLayers: false,
            },
          );

          getSelectedLayers(state)
            .filter(Layers.isPointsLayer)
            .forEach((layer) => {
              const boundingRect = boundingRects[layer.do_objectID];
              layer.points.forEach((curvePoint, index) => {
                const decodedPoint = decodeCurvePoint(curvePoint, boundingRect);

                if (isPointInRange(decodedPoint.point, point)) {
                  selectedPoint = [layer.do_objectID, index];
                } else if (isPointInRange(decodedPoint.curveTo, point)) {
                  selectedControlPoint = {
                    layerId: layer.do_objectID,
                    pointIndex: index,
                    controlPointType: 'curveTo',
                  };
                } else if (isPointInRange(decodedPoint.curveFrom, point)) {
                  selectedControlPoint = {
                    layerId: layer.do_objectID,
                    pointIndex: index,
                    controlPointType: 'curveFrom',
                  };
                }
              });
            });

          const indexPathOfOpenShapeLayer = Selectors.getIndexPathOfOpenShapeLayer(
            state,
          );

          if (selectedPoint) {
            if (canClosePath(state, selectedPoint) && !shiftKey) {
              dispatch('setIsClosed', true);
              dispatch('selectPoint', selectedPoint);
            } else {
              const alreadySelected = state.selectedPointLists[
                selectedPoint[0]
              ]?.includes(selectedPoint[1]);

              dispatch(
                'selectPoint',
                selectedPoint,
                shiftKey || event.metaKey
                  ? alreadySelected
                    ? 'difference'
                    : 'intersection'
                  : 'replace',
              );
              dispatch('interaction', ['maybeMovePoint', point]);
            }
          } else if (selectedControlPoint) {
            dispatch(
              'selectControlPoint',
              selectedControlPoint.layerId,
              selectedControlPoint.pointIndex,
              selectedControlPoint.controlPointType,
            );
            dispatch('interaction', ['maybeMoveControlPoint', point]);
          } else if (indexPathOfOpenShapeLayer) {
            dispatch('addPointToPath', point);
            dispatch('interaction', ['maybeMoveControlPoint', point]);
          } else if (!(shiftKey || event.metaKey)) {
            dispatch('interaction', ['reset']);
          }
          break;
        }
        case 'hoverHandle':
        case 'none': {
          if (state.selectedObjects.length > 0) {
            const direction = Selectors.getScaleDirectionAtPoint(state, point);

            if (direction) {
              dispatch('interaction', [
                'maybeScale',
                point,
                direction,
                visibleCanvasSize,
              ]);

              return;
            }
          }

          const layer = Selectors.getLayerAtPoint(
            CanvasKit,
            state,
            insets,
            rawPoint,
            {
              clickThroughGroups: event.metaKey,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
            },
          );

          if (layer) {
            if (state.selectedObjects.includes(layer.do_objectID)) {
              if (event.shiftKey && state.selectedObjects.length !== 1) {
                dispatch('selectLayer', layer.do_objectID, 'difference');
              }
            } else {
              dispatch(
                'selectLayer',
                layer.do_objectID,
                event.shiftKey ? 'intersection' : 'replace',
              );
            }

            dispatch('interaction', ['maybeMove', point, visibleCanvasSize]);
          } else {
            dispatch('selectLayer', undefined);

            dispatch('interaction', ['startMarquee', rawPoint]);
          }
          break;
        }
      }
    },
    [offsetEventPoint, state, CanvasKit, insets, dispatch, visibleCanvasSize],
  );

  const handleMouseMove = useCallback(
    (event: React.PointerEvent) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      switch (state.interactionState.type) {
        case 'editPath': {
          dispatch('interaction', ['resetEditPath', point]);
          break;
        }
        case 'drawingShapePath': {
          dispatch('interaction', ['drawingShapePath', point]);
          break;
        }
        case 'maybePan': {
          dispatch('interaction', ['startPanning', rawPoint]);

          event.preventDefault();
          break;
        }
        case 'panning': {
          dispatch('interaction', ['updatePanning', rawPoint]);

          event.preventDefault();
          break;
        }
        case 'maybeMove':
        case 'maybeScale': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', [
              state.interactionState.type === 'maybeMove'
                ? 'startMoving'
                : 'startScaling',
              point,
            ]);
          }

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'maybeMovePoint': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingPoint', origin, point]);
          }

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'movingPoint': {
          const { origin } = state.interactionState;

          dispatch('interaction', ['updateMovingPoint', origin, point]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();
          break;
        }
        case 'maybeMoveControlPoint': {
          const { origin } = state.interactionState;

          if (isMoving(point, origin)) {
            dispatch('interaction', ['movingControlPoint', origin, point]);
          }

          event.preventDefault();
          containerRef.current?.setPointerCapture(event.pointerId);
          break;
        }
        case 'movingControlPoint': {
          const { origin } = state.interactionState;

          dispatch('interaction', ['updateMovingControlPoint', origin, point]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

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

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

          break;
        }
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

          break;
        }
        case 'marquee': {
          dispatch('interaction', ['updateMarquee', rawPoint]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

          const { origin, current } = state.interactionState;

          const layers = Selectors.getLayersInRect(
            state,
            insets,
            createRect(origin, current),
            {
              clickThroughGroups: event.metaKey,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
            },
          );

          dispatch(
            'selectLayer',
            layers.map((layer) => layer.do_objectID),
          );

          break;
        }
        case 'hoverHandle': {
          const direction = Selectors.getScaleDirectionAtPoint(state, point);

          if (direction) {
            if (direction !== state.interactionState.direction) {
              dispatch('interaction', ['hoverHandle', direction]);
            }
          } else {
            dispatch('interaction', ['reset']);
          }

          break;
        }
        case 'none': {
          const layer = Selectors.getLayerAtPoint(
            CanvasKit,
            state,
            insets,
            rawPoint,
            {
              clickThroughGroups: event.metaKey,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
            },
          );

          // For perf, check that we actually need to update the highlight.
          // This gets called on every mouse movement.
          if (highlightedLayer?.id !== layer?.do_objectID) {
            highlightLayer(
              layer
                ? {
                    id: layer.do_objectID,
                    precedence: 'belowSelection',
                    isMeasured: event.altKey,
                  }
                : undefined,
            );
          }

          if (state.selectedObjects.length > 0) {
            const direction = Selectors.getScaleDirectionAtPoint(state, point);

            if (direction) {
              dispatch('interaction', ['hoverHandle', direction]);

              return;
            }
          }

          break;
        }
      }
    },
    [
      offsetEventPoint,
      state,
      dispatch,
      CanvasKit,
      insets,
      highlightedLayer?.id,
      highlightLayer,
    ],
  );

  const handleMouseUp = useCallback(
    (event) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      switch (state.interactionState.type) {
        case 'maybePan':
          dispatch('interaction', ['enablePanMode']);

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        case 'panning': {
          dispatch('interaction', ['updatePanning', rawPoint]);
          dispatch('interaction', ['enablePanMode']);

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          dispatch('addDrawnLayer');

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'marquee': {
          dispatch('interaction', ['reset']);

          const { origin, current } = state.interactionState;

          const layers = Selectors.getLayersInRect(
            state,
            insets,
            createRect(origin, current),
            {
              clickThroughGroups: event.metaKey,
              includeHiddenLayers: false,
              includeArtboardLayers: false,
            },
          );

          dispatch(
            'selectLayer',
            layers.map((layer) => layer.do_objectID),
          );

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'maybeMove':
        case 'maybeScale': {
          dispatch('interaction', ['reset']);

          containerRef.current?.releasePointerCapture(event.pointerId);

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
          dispatch('interaction', ['reset']);

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'maybeMoveControlPoint':
        case 'movingControlPoint':
        case 'maybeMovePoint':
        case 'movingPoint': {
          dispatch('interaction', ['resetEditPath', point]);
          containerRef.current?.releasePointerCapture(event.pointerId);
          break;
        }
      }
    },
    [offsetEventPoint, state, dispatch, insets],
  );

  const handleDirection =
    state.interactionState.type === 'hoverHandle' ||
    state.interactionState.type === 'maybeScale' ||
    state.interactionState.type === 'scaling'
      ? state.interactionState.direction
      : undefined;

  const cursor = useMemo((): CSSProperties['cursor'] => {
    switch (state.interactionState.type) {
      case 'panning':
      case 'maybePan':
        return 'grabbing';
      case 'panMode':
        return 'grab';
      case 'insertArtboard':
      case 'insertOval':
      case 'insertRectangle':
      case 'insertText':
        return 'crosshair';
      case 'drawingShapePath':
        return 'crosshair';
      case 'maybeScale':
      case 'scaling':
      case 'hoverHandle':
        if (handleDirection) {
          return getCursorForDirection(handleDirection);
        }
        return 'default';
      case 'editPath': {
        const { point } = state.interactionState;

        return point ? getCursorForEditPathMode(state, point) : 'default';
      }
      case 'maybeMoveControlPoint':
      case 'maybeMovePoint':
      case 'movingControlPoint':
      case 'movingPoint':
        return 'move';
      default:
        return 'default';
    }
  }, [state, handleDirection]);

  return (
    <ContextMenu items={menuItems} onSelect={onSelectMenuItem}>
      <Container
        ref={containerRef}
        cursor={cursor}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
      >
        <InsetContainer insets={insets}>
          {canvasSizeWithInsets && (
            <CanvasKitRenderer size={canvasSizeWithInsets} />
          )}
        </InsetContainer>
      </Container>
    </ContextMenu>
  );
});
