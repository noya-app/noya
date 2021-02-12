import { Point, ShapeType } from 'ayano-state';
import {
  getCurrentPageMetadata,
  getLayerAtPoint,
} from 'ayano-state/src/selectors';
import type { Surface } from 'canvaskit-wasm';
import { useCallback, useEffect, useRef } from 'react';
import { drawCanvas, uuid } from 'sketch-canvas';
import styled, { useTheme } from 'styled-components';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';
import { useSize } from '../hooks/useSize';

declare module 'canvaskit-wasm' {
  interface Surface {
    flush(): void;
  }
}

function getPoint(event: MouseEvent): Point {
  return { x: event.offsetX, y: event.offsetY };
}

const Container = styled.div({
  flex: '1',
  position: 'relative',
});

const CanvasComponent = styled.canvas(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: -theme.sizes.sidebarWidth,
  zIndex: -1,
}));

interface Props {}

export default function Canvas(props: Props) {
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

  // Event coordinates are relative to (0,0), but we want them to include
  // the current document's offset from the origin
  const offsetEventPoint = useCallback(
    (point: Point) => {
      return {
        x: Math.round(point.x - meta.scrollOrigin.x),
        y: Math.round(point.y - meta.scrollOrigin.y),
      };
    },
    [meta],
  );

  // Update the canvas size whenever the window is resized
  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement || !containerSize) return;

    canvasElement.width = containerSize.width + sidebarWidth;
    canvasElement.height = containerSize.height;
  }, [containerSize, sidebarWidth]);

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

    drawCanvas(context, sidebarWidth);

    surface.flush();
  }, [
    CanvasKit,
    state,
    backgroundColor,
    textColor,
    sidebarWidth,
    // `containerSize` affects rendering even though it isn't used here directly
    containerSize,
  ]);

  const handleMouseDown = useCallback(
    (event: React.PointerEvent) => {
      const point = offsetEventPoint(getPoint(event.nativeEvent));

      switch (state.interactionState.type) {
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
        case 'none': {
          const layer = getLayerAtPoint(CanvasKit, state, point);

          if (layer) {
            if (!state.selectedObjects.includes(layer.do_objectID)) {
              dispatch('selectLayer', layer.do_objectID);
            }

            dispatch('interaction', ['maybeMove', point]);
          } else {
            dispatch('selectLayer', undefined);
          }

          break;
        }
      }
    },
    [offsetEventPoint, state, dispatch, CanvasKit],
  );

  const handleMouseMove = useCallback(
    (event: React.PointerEvent) => {
      const point = offsetEventPoint(getPoint(event.nativeEvent));

      switch (state.interactionState.type) {
        case 'maybeMove': {
          const { origin } = state.interactionState;

          if (
            Math.abs(point.x - origin.x) > 2 ||
            Math.abs(point.y - origin.y) > 2
          ) {
            dispatch('interaction', ['startMoving', point]);
          }

          containerRef.current?.setPointerCapture(event.pointerId);
          event.preventDefault();

          break;
        }
        case 'moving': {
          dispatch('interaction', ['updateMoving', point]);

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
        case 'none': {
          const layer = getLayerAtPoint(CanvasKit, state, point);

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

          break;
        }
      }
    },
    [CanvasKit, state, dispatch, offsetEventPoint],
  );

  const handleMouseUp = useCallback(
    (event) => {
      const point = offsetEventPoint(getPoint(event.nativeEvent));

      switch (state.interactionState.type) {
        case 'drawing': {
          dispatch('interaction', ['updateDrawing', point]);
          dispatch('addDrawnLayer');

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'maybeMove': {
          dispatch('interaction', ['reset']);

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
        case 'moving': {
          dispatch('interaction', ['updateMoving', point]);
          dispatch('interaction', ['reset']);

          containerRef.current?.releasePointerCapture(event.pointerId);

          break;
        }
      }
    },
    [dispatch, state, offsetEventPoint],
  );

  return (
    <Container
      ref={containerRef}
      onPointerDown={handleMouseDown}
      onPointerMove={handleMouseMove}
      onPointerUp={handleMouseUp}
    >
      <CanvasComponent id="main" ref={canvasRef} />
    </Container>
  );
}
