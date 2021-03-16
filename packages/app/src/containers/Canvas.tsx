import { renderCanvas, uuid } from 'noya-renderer';
import { CompassDirection, Point, ShapeType } from 'noya-state';
import {
  getCurrentPageMetadata,
  getLayerAtPoint,
  getLayersInRect,
  getScaleDirectionAtPoint,
} from 'noya-state/src/selectors';
import type { Surface } from 'canvaskit-wasm';
import {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import styled, { useTheme } from 'styled-components';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';
import { useSize } from '../hooks/useSize';
import { createRect } from 'noya-renderer/src/primitives';

declare module 'canvaskit-wasm' {
  interface Surface {
    flush(): void;
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

export default memo(function Canvas() {
  const {
    colors: {
      textMuted: textColor,
      canvas: { background: backgroundColor },
    },
    sizes: { sidebarWidth },
  } = useTheme();
  const [state, dispatch] = useApplicationState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const CanvasKit = useCanvasKit();
  const surfaceRef = useRef<Surface | null>(null);
  const containerSize = useSize(containerRef);
  const meta = useSelector(getCurrentPageMetadata);

  const insets = useMemo(
    () => ({
      left: sidebarWidth,
      right: sidebarWidth,
    }),
    [sidebarWidth],
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

  // Update the canvas size whenever the window is resized
  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement || !containerSize) return;

    canvasElement.width = containerSize.width + insets.left + insets.right;
    canvasElement.height = containerSize.height;

    dispatch(
      'setCanvasSize',
      { width: containerSize.width, height: containerSize.height },
      insets,
    );
  }, [dispatch, containerSize, insets]);

  // Recreate the surface whenever the canvas resizes
  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) return;

    const surface = CanvasKit.MakeCanvasSurface(canvasElement.id);

    if (!surface) {
      surfaceRef.current = null;

      console.log('failed to create surface');
      return;
    }

    surfaceRef.current = surface;

    return () => {
      surfaceRef.current?.delete();
      surfaceRef.current = null;
    };
  }, [CanvasKit, containerSize]);

  useEffect(() => {
    if (!surfaceRef.current) return;

    const surface = surfaceRef.current;
    const context = {
      CanvasKit,
      canvas: surface.getCanvas(),
      state,
      theme: {
        textColor,
        backgroundColor,
      },
    };

    renderCanvas(context);

    surface.flush();
  }, [CanvasKit, state, backgroundColor, textColor]);

  const handleMouseDown = useCallback(
    (event: React.PointerEvent) => {
      const rawPoint = getPoint(event.nativeEvent);
      const point = offsetEventPoint(rawPoint);

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
            const direction = getScaleDirectionAtPoint(state, point);

            if (direction) {
              dispatch('interaction', ['maybeScale', point, direction]);

              return;
            }
          }

          const layer = getLayerAtPoint(CanvasKit, state, point, {
            clickThroughGroups: event.metaKey,
          });

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

            dispatch('interaction', ['maybeMove', point]);
          } else {
            dispatch('selectLayer', undefined);

            dispatch('interaction', ['startMarquee', point]);
          }
          break;
        }
      }
    },
    [offsetEventPoint, state, dispatch, CanvasKit],
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
          dispatch('interaction', ['updateMarquee', point]);

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

          const { origin, current } = state.interactionState;

          const layers = getLayersInRect(
            CanvasKit,
            state,
            createRect(origin, current),
            {
              clickThroughGroups: event.metaKey,
            },
          );

          dispatch(
            'selectLayer',
            layers.map((layer) => layer.do_objectID),
          );

          break;
        }
        case 'hoverHandle': {
          const direction = getScaleDirectionAtPoint(state, point);

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
          const layer = getLayerAtPoint(CanvasKit, state, point, {
            clickThroughGroups: event.metaKey,
          });

          // For perf, check that we actually need to update the highlight.
          // This gets called on every mouse movement.
          if (state.highlightedLayer?.id !== layer?.do_objectID) {
            dispatch(
              'highlightLayer',
              layer
                ? { id: layer.do_objectID, precedence: 'belowSelection' }
                : undefined,
            );
          }

          if (state.selectedObjects.length > 0) {
            const direction = getScaleDirectionAtPoint(state, point);

            if (direction) {
              dispatch('interaction', ['hoverHandle', direction]);

              return;
            }
          }

          break;
        }
      }
    },
    [CanvasKit, state, dispatch, offsetEventPoint],
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

          const layers = getLayersInRect(
            CanvasKit,
            state,
            createRect(origin, current),
            {
              clickThroughGroups: event.metaKey,
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
    [CanvasKit, offsetEventPoint, state, dispatch],
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
    <Container
      ref={containerRef}
      cursor={cursor}
      onPointerDown={handleMouseDown}
      onPointerMove={handleMouseMove}
      onPointerUp={handleMouseUp}
    >
      <CanvasComponent
        id="main"
        ref={canvasRef}
        left={-insets.left}
        width={0}
        height={0}
      />
    </Container>
  );
});
