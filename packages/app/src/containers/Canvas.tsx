import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { PageLayer, Point, Rect } from 'ayano-state';
import {
  getCurrentPage,
  getCurrentPageMetadata,
  getLayerAtPoint,
} from 'ayano-state/src/selectors';
import type { Surface } from 'canvaskit-wasm';
import produce from 'immer';
import { useCallback, useEffect, useRef } from 'react';
import { drawCanvas, uuid } from 'sketch-canvas';
import { useTheme } from 'styled-components';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';
import { useSize } from '../hooks/useSize';
import rectangle from '../rectangleExample';

const oval = require('../models/oval.json') as Sketch.Oval;

declare module 'canvaskit-wasm' {
  interface Surface {
    flush(): void;
  }
}

interface Props {}

function getPoint(event: MouseEvent): Point {
  return { x: event.offsetX, y: event.offsetY };
}

function createRect(initialPoint: Point, finalPoint: Point): Rect {
  return {
    width: Math.abs(finalPoint.x - initialPoint.x),
    height: Math.abs(finalPoint.y - initialPoint.y),
    x: Math.min(finalPoint.x, initialPoint.x),
    y: Math.min(finalPoint.y, initialPoint.y),
  };
}

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
        state.interactionState.type !== 'insertOval'
      ) {
        return;
      }

      const rect = createRect(point, point);

      const id = uuid();
      const frame: Sketch.Rect = {
        _class: 'rect',
        constrainProportions: false,
        ...rect,
      };

      let layer: PageLayer =
        state.interactionState.type === 'insertOval'
          ? { ...oval, do_objectID: id, frame }
          : { ...rectangle, do_objectID: id, frame };

      dispatch('interaction', {
        type: 'drawing',
        value: layer,
        origin: point,
      });
    },
    [dispatch, state, offsetEventPoint],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (state.interactionState.type !== 'drawing') return;

      const point = offsetEventPoint(getPoint(event.nativeEvent));
      const rect = createRect(state.interactionState.origin, point);

      const layer = produce(state.interactionState.value, (layer) => {
        layer.frame = {
          ...layer.frame,
          ...rect,
        };
      });

      dispatch('interaction', {
        type: 'drawing',
        value: layer,
        origin: state.interactionState.origin,
      });
    },
    [dispatch, state, offsetEventPoint],
  );

  const handleMouseUp = useCallback(
    (event) => {
      const point = offsetEventPoint(getPoint(event.nativeEvent));

      if (state.interactionState.type === 'none') {
        const layer = getLayerAtPoint(CanvasKit, state, point);

        if (layer) {
          return dispatch('selectLayer', layer.do_objectID);
        } else {
          return dispatch('deselectAllLayers');
        }
      }

      if (state.interactionState.type !== 'drawing') return;

      const rect = createRect(state.interactionState.origin, point);

      if (rect.width === 0 || rect.height === 0) {
        return dispatch('interaction', { type: 'none' });
      }

      const layer = produce(state.interactionState.value, (layer) => {
        layer.frame = {
          ...layer.frame,
          ...rect,
        };
      });

      dispatch('interaction', { type: 'none' });
      dispatch('addLayer', layer);
      dispatch('selectLayer', layer.do_objectID);
    },
    [CanvasKit, dispatch, state, offsetEventPoint],
  );

  return (
    <div
      ref={containerRef}
      style={{ flex: '1', position: 'relative' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas
        id="main"
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: -sidebarWidth,
          zIndex: -1,
        }}
      />
    </div>
  );
}
