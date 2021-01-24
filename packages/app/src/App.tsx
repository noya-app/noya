import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import {
  CanvasKit,
  load,
  makeCanvasSurface,
  drawRectangle,
} from 'sketch-canvas';
import rectangleExample from './rectangleExample';

export default function App() {
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
