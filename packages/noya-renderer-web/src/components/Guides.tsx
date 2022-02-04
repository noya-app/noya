import { Paint } from 'canvaskit';
import { Point } from 'noya-geometry';
import { useDeletable, useStroke } from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Polyline, useCanvasKit } from '..';
import { pixelAlignPoints } from '../pixelAlignment';

interface GuideProps {
  points: [Point, Point];
  paint: Paint;
}

function Guide({ points, paint }: GuideProps) {
  const alignedPoints = useMemo(() => pixelAlignPoints(points), [points]);

  return <Polyline paint={paint} points={alignedPoints} />;
}

interface Props {
  points: [Point, Point];
}

export function AlignmentGuide({ points }: Props) {
  const primaryColor = useTheme().colors.primary;
  const paint = useStroke({ color: primaryColor });

  return <Guide paint={paint} points={points} />;
}

export function MeasurementGuide({ points }: Props) {
  const measurementColor = useTheme().colors.canvas.measurement;
  const paint = useStroke({ color: measurementColor });

  return <Guide paint={paint} points={points} />;
}

export function ExtensionGuide({ points }: Props) {
  const CanvasKit = useCanvasKit();
  const primaryColor = useTheme().colors.primary;

  const paint = useMemo(() => {
    console.log('Guide.useMemo');
    const paint = new CanvasKit.Paint();
    paint.setColor(CanvasKit.parseColorString(primaryColor));
    paint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
    paint.setStyle(CanvasKit.PaintStyle.Stroke);
    paint.setStrokeWidth(1);
    return paint;
  }, [CanvasKit, primaryColor]);

  useDeletable(paint);

  return <Guide paint={paint} points={points} />;
}
