import { Action, ApplicationState } from 'ayano-state';
import type { CanvasKit, Surface } from 'canvaskit-wasm';
import { useEffect, useRef, useState } from 'react';
import { drawRectangle, load } from 'sketch-canvas';
import './App.css';
import rectangleExample from './rectangleExample';

declare module 'canvaskit-wasm' {
  interface Surface {
    flush(): void;
  }
}

interface Props {
  state: ApplicationState;
  dispatch: (action: Action) => void;
}

export default function Canvas({ state, dispatch }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [CanvasKit, setCanvasKit] = useState<CanvasKit | null>(null);
  const [surface, setSurface] = useState<Surface | null>(null);

  useEffect(() => {
    load().then(setCanvasKit);
  }, []);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement || !CanvasKit) return;

    const surface = CanvasKit.MakeCanvasSurface(canvasElement.id);

    if (!surface) {
      setSurface(null);

      console.log('failed to create surface');
      return;
    }

    setSurface(surface);
  }, [CanvasKit]);

  useEffect(() => {
    if (!surface || !CanvasKit) return;

    const { sketch, selectedPage } = state;
    const context = { CanvasKit, canvas: surface.getCanvas() };

    console.log(context);

    const page = sketch.pages.find((page) => page.do_objectID === selectedPage);

    if (!page) return;

    page.layers.forEach((layer) => {
      if (layer._class === 'rectangle') {
        drawRectangle(context, layer);
      }
    });

    surface.flush();
  }, [CanvasKit, surface, state]);

  return (
    <canvas
      onClick={(event) => {
        dispatch({
          type: 'addLayer',
          layer: {
            ...rectangleExample,
            frame: {
              _class: 'rect',
              constrainProportions: false,
              x: event.clientX,
              y: event.clientY,
              width: 100,
              height: 100,
            },
          },
        });
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      id="main"
      ref={canvasRef}
    />
  );
}
