import type { Surface } from 'canvaskit';
import { ContextMenu } from 'noya-designsystem';
import { createRect } from 'noya-geometry';
import { render, unmount } from 'noya-react-canvaskit';
import { SketchFileRenderer, uuid } from 'noya-renderer';
import { CompassDirection, Point, Selectors, ShapeType } from 'noya-state';
import {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled, { ThemeProvider, useTheme } from 'styled-components';
import {
  StateProvider,
  useApplicationState,
  useSelector,
  useWorkspaceState,
} from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';
import { useSize } from '../hooks/useSize';
import { useWorkspace } from '../hooks/useWorkspace';
import * as MouseEvent from '../utils/mouseEvent';

declare module 'canvaskit' {
  interface Surface {
    flush(): void;
    _id: number;
  }
}

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

const Container = styled.div<{ cursor: CSSProperties['cursor'] }>(
  ({ cursor }) => ({
    flex: '1',
    position: 'relative',
    cursor,
  }),
);

const CanvasComponent = styled.canvas<{ left: number }>(({ theme, left }) => ({
  position: 'absolute',
  top: 0,
  left,
  zIndex: -1,
}));

type MenuItemType = 'selectAll' | 'delete';

export default memo(function Canvas() {
  const theme = useTheme();
  const {
    sizes: { sidebarWidth },
  } = theme;
  const workspaceState = useWorkspaceState();
  const [state, dispatch] = useApplicationState();
  const [surface, setSurface] = useState<Surface | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const CanvasKit = useCanvasKit();
  const containerSize = useSize(containerRef);
  const meta = useSelector(Selectors.getCurrentPageMetadata);
  const { setCanvasSize, highlightLayer, highlightedLayer } = useWorkspace();

  const insets = useMemo(
    () => ({
      left: sidebarWidth,
      right: sidebarWidth,
    }),
    [sidebarWidth],
  );

  const canvasSize = useMemo(() => containerSize ?? { width: 0, height: 0 }, [
    containerSize,
  ]);

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

  // Update the canvas size whenever the window is resized
  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement || !containerSize) return;

    canvasElement.width = containerSize.width + insets.left + insets.right;
    canvasElement.height = containerSize.height;

    setCanvasSize(
      { width: containerSize.width, height: containerSize.height },
      insets,
    );
  }, [dispatch, containerSize, insets, setCanvasSize]);

  // Recreate the surface whenever the canvas resizes
  //
  // TODO: This should also be a layout effect so that it happens before the canvas is rendered.
  // However, there seems to be a problem with the ordering of things when it's a layout effect.
  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement || !containerSize) return;

    const surface = CanvasKit.MakeCanvasSurface(canvasElement);

    if (!surface) {
      console.warn('failed to create surface');
    }

    setSurface(surface);

    return () => {
      surface?.delete();
    };
  }, [CanvasKit, containerSize]);

  // We use `useLayoutEffect` so that the canvas updates as soon as possible,
  // even at the expense of the UI stuttering slightly.
  // With `useEffect`, the updates are batched and potentially delayed, which
  // makes continuous events like modifying a color unusably slow.
  useLayoutEffect(() => {
    if (!surface || surface.isDeleted() || !containerSize) return;

    try {
      render(
        <ThemeProvider theme={theme}>
          <StateProvider state={workspaceState}>
            <SketchFileRenderer />
          </StateProvider>
        </ThemeProvider>,
        surface,
        CanvasKit,
      );

      return () => {
        unmount(surface);
      };
    } catch (e) {
      console.warn('rendering error', e);
    }
  }, [CanvasKit, state, containerSize, workspaceState, theme, surface]);

  const menuItems: ContextMenu.MenuItem<MenuItemType>[] = useMemo(
    () =>
      state.selectedObjects.length > 0
        ? [{ value: 'delete', title: 'Delete' }]
        : [{ value: 'selectAll', title: 'Select All' }],
    [state.selectedObjects.length],
  );

  const handleSelectMenuItem = useCallback(
    (value: MenuItemType) => {
      switch (value) {
        case 'selectAll':
          dispatch('selectAllLayers');
          break;
        case 'delete':
          dispatch('deleteLayer', state.selectedObjects);
          break;
      }
    },
    [dispatch, state.selectedObjects],
  );

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
        case 'hoverHandle':
        case 'none': {
          if (state.selectedObjects.length > 0) {
            const direction = Selectors.getScaleDirectionAtPoint(state, point);

            if (direction) {
              dispatch('interaction', [
                'maybeScale',
                point,
                direction,
                canvasSize,
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

            dispatch('interaction', ['maybeMove', point, canvasSize]);
          } else {
            dispatch('selectLayer', undefined);

            dispatch('interaction', ['startMarquee', rawPoint]);
          }
          break;
        }
      }
    },
    [offsetEventPoint, state, CanvasKit, insets, dispatch, canvasSize],
  );

  const handleMouseMove = useCallback(
    (event: React.PointerEvent) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

      switch (state.interactionState.type) {
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

          if (
            Math.abs(point.x - origin.x) > 2 ||
            Math.abs(point.y - origin.y) > 2
          ) {
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
      case 'maybeScale':
      case 'scaling':
      case 'hoverHandle':
        if (handleDirection) {
          return getCursorForDirection(handleDirection);
        }
        return 'default';
      default:
        return 'default';
    }
  }, [state.interactionState.type, handleDirection]);

  return (
    <ContextMenu.Root items={menuItems} onSelect={handleSelectMenuItem}>
      <Container
        ref={containerRef}
        cursor={cursor}
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
      >
        <CanvasComponent
          ref={canvasRef}
          left={-insets.left}
          width={0}
          height={0}
        />
      </Container>
    </ContextMenu.Root>
  );
});
