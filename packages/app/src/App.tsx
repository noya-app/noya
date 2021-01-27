import {
  Action,
  ApplicationState,
  createInitialState,
  reducer,
} from 'ayano-state';
import type { CanvasKit, Surface } from 'canvaskit-wasm';
import { useEffect, useReducer, useRef, useState } from 'react';
import { drawRectangle, load } from 'sketch-canvas';
import { parse, SketchFile } from 'sketch-zip';
import './App.css';
import { useResource } from './hooks/useResource';
import { PromiseState } from './utils/PromiseState';
import rectangleExample from './rectangleExample';

declare module 'canvaskit-wasm' {
  interface Surface {
    flush(): void;
  }
}

export default function App() {
  const sketchFile = useResource<ArrayBuffer>(
    '/Rectangle.sketch',
    'arrayBuffer',
  );

  // const parsedSketchFile = useRef<SketchFile | undefined>();

  const [state, dispatch] = useReducer(
    (
      state: PromiseState<ApplicationState>,
      action: { type: 'set'; value: SketchFile } | Action,
    ): PromiseState<ApplicationState> => {
      if (action.type === 'set') {
        return {
          type: 'success',
          value: createInitialState(action.value),
        };
      }

      if (state.type === 'success') {
        return {
          type: 'success',
          value: reducer(state.value, action),
        };
      }

      return state;
    },
    { type: 'pending' },
  );

  useEffect(() => {
    parse(sketchFile).then((parsed) => {
      dispatch({ type: 'set', value: parsed });
      // parsedSketchFile.current = parsed;
    });
  }, [sketchFile]);

  // console.log('parsed', parsedSketchFile);

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
    if (!surface || !CanvasKit || state.type !== 'success') return;

    const { sketch, selectedPage } = state.value;
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
