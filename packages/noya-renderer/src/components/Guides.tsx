import { Paint } from '@noya-app/noya-canvaskit';
import { Point } from '@noya-app/noya-geometry';
import { Polyline } from '@noya-app/noya-graphics';
import { useDeletable, useStroke } from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { useZoom } from '../ZoomContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
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
  const zoom = useZoom();
  const primaryColor = useTheme().colors.primary;
  const paint = useStroke({ color: primaryColor, strokeWidth: 1 / zoom });

  return <Guide paint={paint} points={points} />;
}

export function MeasurementGuide({ points }: Props) {
  const zoom = useZoom();
  const measurementColor = useTheme().colors.canvas.measurement;
  const paint = useStroke({ color: measurementColor, strokeWidth: 1 / zoom });

  return <Guide paint={paint} points={points} />;
}

export function ExtensionGuide({ points }: Props) {
  const CanvasKit = useCanvasKit();
  const primaryColor = useTheme().colors.primary;
  const zoom = useZoom();

  const paint = useMemo(() => {
    const paint = new CanvasKit.Paint();
    paint.setColor(CanvasKit.parseColorString(primaryColor));
    paint.setPathEffect(CanvasKit.PathEffect.MakeDash([1 / zoom, 2 / zoom]));
    paint.setStyle(CanvasKit.PaintStyle.Stroke);
    paint.setStrokeWidth(1 / zoom);
    return paint;
  }, [CanvasKit, primaryColor, zoom]);

  useDeletable(paint);

  return <Guide paint={paint} points={points} />;
}
