import { Point, ShapeType } from 'ayano-state';
import {
  getCurrentPage,
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
  const { sidebarWidth } = useTheme().sizes;
  const [state, dispatch] = useApplicationState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const CanvasKit = useCanvasKit();
  const surfaceRef = useRef<Surface | null>(null);
  const containerSize = useSize(containerRef);

  const currentPage = useSelector(getCurrentPage);
  const meta = useSelector(getCurrentPageMetadata);

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
    const context = { CanvasKit, canvas: surface.getCanvas() };

    drawCanvas(context, state, sidebarWidth);

    surface.flush();
  }, [CanvasKit, state, containerSize, currentPage, meta, sidebarWidth]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      const point = offsetEventPoint(getPoint(event.nativeEvent));

      if (
        state.interactionState.type !== 'insertRectangle' &&
        state.interactionState.type !== 'insertOval' &&
        state.interactionState.type !== 'insertText'
      ) {
        return;
      }

      const id = uuid();

      dispatch('interaction', [
        'startDrawing',
        state.interactionState.type.slice(6).toLowerCase() as ShapeType,
        id,
        point,
      ]);
    },
    [dispatch, state, offsetEventPoint],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const point = offsetEventPoint(getPoint(event.nativeEvent));

      switch (state.interactionState.type) {
        case 'drawing':
          dispatch('interaction', ['updateDrawing', point]);
          return;
        case 'none':
          const layer = getLayerAtPoint(CanvasKit, state, point);

          dispatch(
            'highlightLayer',
            layer
              ? { id: layer.do_objectID, precedence: 'belowSelection' }
              : undefined,
          );
          return;
      }
    },
    [CanvasKit, state, dispatch, offsetEventPoint],
  );

  const handleMouseUp = useCallback(
    (event) => {
      const point = offsetEventPoint(getPoint(event.nativeEvent));

      if (state.interactionState.type === 'none') {
        const layer = getLayerAtPoint(CanvasKit, state, point);

        return dispatch('selectLayer', layer?.do_objectID);
      }

      if (state.interactionState.type !== 'drawing') return;

      dispatch('interaction', ['updateDrawing', point]);
      dispatch('addDrawnLayer');
    },
    [CanvasKit, dispatch, state, offsetEventPoint],
  );

  return (
    <Container
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <CanvasComponent id="main" ref={canvasRef} />
    </Container>
  );
}
