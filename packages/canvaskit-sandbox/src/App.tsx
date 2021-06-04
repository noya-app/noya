import type { CanvasKit } from 'canvaskit';
import { load } from 'noya-renderer';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Props {
  CanvasKit: CanvasKit;
}

function Canvas({ CanvasKit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    const canvasElement = canvasRef.current;

    if (!canvasElement) return;

    const surface = CanvasKit.MakeCanvasSurface(canvasElement);
    const canvas = surface?.getCanvas();

    if (!canvas) return;

    const paint = new CanvasKit.Paint();
    paint.setColor(CanvasKit.RED);
    paint.setStyle(CanvasKit.PaintStyle.Fill);

    canvas.drawRect(CanvasKit.XYWHRect(10, 10, 100, 100), paint);

    surface?.flush();
  }, [CanvasKit]);

  return <canvas ref={canvasRef} />;
}

function App() {
  const [CanvasKit, setCanvasKit] = useState<CanvasKit | undefined>(undefined);

  useEffect(() => {
    load().then(setCanvasKit);
  }, []);

  if (!CanvasKit) return null;

  return <Canvas CanvasKit={CanvasKit} />;
}

export default App;
