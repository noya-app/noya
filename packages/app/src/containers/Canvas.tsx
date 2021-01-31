import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import { PageLayer, Point, Rect } from 'ayano-state';
import type { Surface } from 'canvaskit-wasm';
import produce from 'immer';
import { useEffect, useRef } from 'react';
import { drawLayer, uuid } from 'sketch-canvas';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';
import { useSize } from '../hooks/useSize';
import rectangle from '../rectangleExample';

const oval = require('../models/oval.json') as FileFormat.Oval;

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
  const [state, dispatch] = useApplicationState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const CanvasKit = useCanvasKit();
  const surfaceRef = useRef<Surface | null>(null);
  const containerSize = useSize(containerRef);

  // Update the canvas size whenever the window is resized
  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement || !containerSize) return;

    canvasElement.width = containerSize.width;
    canvasElement.height = containerSize.height;
  }, [containerSize]);

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

    const { sketch, selectedPage, interactionState } = state;
    const context = { CanvasKit, canvas: surface.getCanvas() };

    const page = sketch.pages.find((page) => page.do_objectID === selectedPage);

    if (!page) return;

    context.canvas.clear(CanvasKit.Color(249, 249, 249));

    page.layers.forEach((layer) => {
      drawLayer(context, layer);
    });

    if (interactionState.type === 'drawing') {
      drawLayer(context, interactionState.value as any);
    }

    surface.flush();
  }, [CanvasKit, state, containerSize]);

  return (
    <div ref={containerRef} style={{ flex: '1', position: 'relative' }}>
      <canvas
        id="main"
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
        onMouseDown={(event) => {
          if (
            state.interactionState.type !== 'insertRectangle' &&
            state.interactionState.type !== 'insertOval'
          ) {
            return;
          }

          const point = getPoint(event.nativeEvent);
          const rect = createRect(point, point);

          // state.interactionState.type === 'insertRectangle' ?

          const id = uuid();
          const frame: FileFormat.Rect = {
            _class: 'rect',
            constrainProportions: false,
            ...rect,
          };

          let layer: PageLayer =
            state.interactionState.type === 'insertOval'
              ? { ...oval, do_objectID: id, frame }
              : { ...rectangle, do_objectID: id, frame };

          dispatch([
            'interaction',
            {
              type: 'drawing',
              value: layer,
              origin: point,
            },
          ]);
        }}
        onMouseMove={(event) => {
          if (state.interactionState.type !== 'drawing') return;

          const point = getPoint(event.nativeEvent);
          const rect = createRect(state.interactionState.origin, point);

          const layer = produce(state.interactionState.value, (layer) => {
            layer.frame = {
              ...layer.frame,
              ...rect,
            };
          });

          dispatch([
            'interaction',
            {
              type: 'drawing',
              value: layer,
              origin: state.interactionState.origin,
            },
          ]);
        }}
        onMouseUp={(event) => {
          if (state.interactionState.type !== 'drawing') return;

          const point = getPoint(event.nativeEvent);
          const rect = createRect(state.interactionState.origin, point);

          if (rect.width === 0 || rect.height === 0) {
            dispatch(['interaction', { type: 'none' }]);
            return;
          }

          const layer = produce(state.interactionState.value, (layer) => {
            layer.frame = {
              ...layer.frame,
              ...rect,
            };
          });

          dispatch(['interaction', { type: 'none' }]);
          dispatch(['addLayer', layer]);
          dispatch(['selectLayer', layer.do_objectID]);
        }}
      />
    </div>
  );
}
