import { Point } from 'noya-geometry';
import { useCanvasKit } from 'noya-renderer';
import React from 'react';
import { Polyline } from '..';

interface Props {
  points: Point[];
}

export default function ExtensionGuide({ points }: Props) {
  const CanvasKit = useCanvasKit();

  const paint = new CanvasKit.Paint();
  paint.setColor(CanvasKit.Color4f(0.52, 0.248, 1.0));
  paint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
  paint.setStyle(CanvasKit.PaintStyle.Stroke);
  paint.setStrokeWidth(1);

  return <Polyline paint={paint} points={points} />;
}
