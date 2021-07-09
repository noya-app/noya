import { Point } from 'noya-geometry';
import { useColorFill, usePaint } from 'noya-react-canvaskit';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import React, { useMemo } from 'react';
import { Polyline, Rect, Text } from '..';
import { DistanceMeasurementProps } from './guides';

function DistanceMeasurement({
  distance,
  midpoint: bounds,
}: DistanceMeasurementProps) {
  const CanvasKit = useCanvasKit();
  const fontManager = useFontManager();
  const paragraph = useMemo(() => {
    const paragraphStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.parseColorString('rgb(255,255,225)'),
        fontSize: 11,
        fontFamilies: ['Roboto'],
        letterSpacing: 0.2,
      },
    });

    const builder = CanvasKit.ParagraphBuilder.Make(
      paragraphStyle,
      fontManager,
    );
    builder.addText(distance.toString());

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager, distance]);

  const labelRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        bounds.x,
        bounds.y,
        paragraph.getMinIntrinsicWidth(),
        paragraph.getHeight(),
      ),
    [CanvasKit, paragraph, bounds],
  );

  const bgRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        bounds.x - 2,
        bounds.y - 1,
        paragraph.getMinIntrinsicWidth() + 5,
        paragraph.getHeight() + 2,
      ),
    [CanvasKit, paragraph, bounds],
  );

  const backgroundFill = useColorFill('rgb(43, 92, 207)');

  return (
    <>
      <Rect rect={bgRect} paint={backgroundFill} />
      <Text rect={labelRect} paragraph={paragraph} />
    </>
  );
}

interface Props {
  measurement: Point[];
  distanceMeasurement: DistanceMeasurementProps;
}

export default function MeasurementGuide({
  measurement,
  distanceMeasurement,
}: Props) {
  const CanvasKit = useCanvasKit();

  const extensionGuidePaint = new CanvasKit.Paint();
  extensionGuidePaint.setColor(CanvasKit.Color4f(0.52, 0.248, 1.0));
  extensionGuidePaint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
  extensionGuidePaint.setStyle(CanvasKit.PaintStyle.Stroke);
  extensionGuidePaint.setStrokeWidth(1);

  const measurementGuidePaint = usePaint({
    color: CanvasKit.Color4f(0.0, 0.2, 1.0),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });

  return (
    <>
      <Polyline paint={measurementGuidePaint} points={measurement} />
      <DistanceMeasurement
        midpoint={distanceMeasurement.midpoint}
        distance={distanceMeasurement.distance}
      />
    </>
  );
}
