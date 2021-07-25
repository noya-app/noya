import { Point } from 'noya-geometry';
import { useColor } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Polyline } from '..';
import { pixelAlignPoints } from '../pixelAlignment';

interface Props {
  points: [Point, Point];
}

export default function ExtensionGuide({ points }: Props) {
  const CanvasKit = useCanvasKit();
  const primaryColor = useTheme().colors.primary;

  const paint = new CanvasKit.Paint();
  paint.setColor(useColor(primaryColor));
  paint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
  paint.setStyle(CanvasKit.PaintStyle.Stroke);
  paint.setStrokeWidth(1);

  const alignedPoints = useMemo(() => pixelAlignPoints(points), [points]);

  return <Polyline paint={paint} points={alignedPoints} />;
}
