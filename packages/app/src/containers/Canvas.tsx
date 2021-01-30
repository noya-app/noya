import { PageLayer, Point, Rect } from 'ayano-state';
import type { Surface } from 'canvaskit-wasm';
import produce from 'immer';
import { useEffect, useRef, useState } from 'react';
import { drawLayer, uuid } from 'sketch-canvas';
import { useApplicationState } from '../contexts/ApplicationStateContext';
import useCanvasKit from '../hooks/useCanvasKit';
import rectangleExample from '../rectangleExample';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const CanvasKit = useCanvasKit();
  const [surface, setSurface] = useState<Surface | null>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) return;

    const surface = CanvasKit.MakeCanvasSurface(canvasElement.id);

    if (!surface) {
      setSurface(null);

      console.log('failed to create surface');
      return;
    }

    setSurface(surface);
  }, [CanvasKit]);

  useEffect(() => {
    if (!surface) return;

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
  }, [CanvasKit, surface, state]);

  return (
    <canvas
      onMouseDown={(event) => {
        const point = getPoint(event.nativeEvent);
        const rect = createRect(point, point);

        const layer: PageLayer = {
          ...rectangleExample,
          do_objectID: uuid(),
          frame: {
            _class: 'rect',
            constrainProportions: false,
            ...rect,
          },
        };

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

        const layer = produce(state.interactionState.value, (layer) => {
          layer.frame = {
            ...layer.frame,
            ...rect,
          };
        });

        dispatch(['interaction', { type: 'ready' }]);
        dispatch(['addLayer', layer]);
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      id="main"
      ref={canvasRef}
    />
  );
}
