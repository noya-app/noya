import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import {
  CanvasKit,
  load,
  makeCanvasSurface,
  drawRectangle,
} from 'sketch-canvas';
import rectangleExample from './rectangleExample';
import { useResource } from './hooks/useResource';
import { parse, SketchFile } from 'sketch-zip';

export default function App() {
  const sketchFile = useResource<ArrayBuffer>(
    '/Rectangle.sketch',
    'arrayBuffer',
  );

  const parsedSketchFile = useRef<SketchFile | undefined>();

  useEffect(() => {
    parse(sketchFile).then((parsed) => {
      parsedSketchFile.current = parsed;
    });
  }, [sketchFile]);

  console.log('parsed', parsedSketchFile);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [CanvasKit, setCanvasKit] = useState<CanvasKit | null>(null);

  useEffect(() => {
    load().then(setCanvasKit);
  }, []);

  useEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement || !CanvasKit) return;

    const surfaceContext = makeCanvasSurface(CanvasKit, canvasElement.id);

    if (!surfaceContext) return;

    const { canvas, surface } = surfaceContext;

    drawRectangle(surfaceContext, rectangleExample);

    (surface as any).flush();
  }, [CanvasKit]);

  return (
    <canvas
      width={window.innerWidth}
      height={window.innerHeight}
      id="main"
      ref={canvasRef}
    />
  );
}
