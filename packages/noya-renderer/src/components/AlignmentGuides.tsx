import { Point } from 'noya-geometry';
import { usePaint } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import React from 'react';
import { Polyline } from '..';

export default function AlignmentGuides({ lines }: { lines: Point[][] }) {
  const CanvasKit = useCanvasKit();

  const snapGuidePaint = usePaint({
    color: CanvasKit.Color4f(0.52, 0.248, 1.0),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });

  return (
    <>
      {lines.map((points, index) => (
        <Polyline key={index} paint={snapGuidePaint} points={points} />
      ))}
    </>
  );
}
