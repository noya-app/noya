import { Point } from 'noya-geometry';
import {
  Polyline,
  Rect as RCKRect,
  Text,
  useColorFill,
  useFontManager,
  usePaint,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { DistanceMeasurementProps } from './guides';

function DistanceMeasurement({ distance, bounds }: DistanceMeasurementProps) {
  const { CanvasKit } = useReactCanvasKit();
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
      <RCKRect rect={bgRect} paint={backgroundFill} />
      <Text rect={labelRect} paragraph={paragraph} />
    </>
  );
}

type Guides = {
  extension: Point[];
  measurement: Point[];
  snap: Point[];
  distanceMeasurement: DistanceMeasurementProps;
};

export default function DistanceLabelAndPath({
  guides,
  showSnap,
}: {
  guides: Guides[];
  showSnap?: boolean;
}) {
  const { CanvasKit } = useReactCanvasKit();

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

  const snapGuidePaint = usePaint({
    color: CanvasKit.Color4f(0.52, 0.248, 1.0),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });
  const extensionGuides = guides.map((line) => line.extension);
  const measurementGuides = guides.map((line) => line.measurement);
  const snapGuides = guides.map((line) => line.snap);
  const distanceMeasurements = guides.map((line) => line.distanceMeasurement);

  return (
    <>
      {extensionGuides.map((points, index) => (
        <Polyline key={index} paint={extensionGuidePaint} points={points} />
      ))}
      {measurementGuides.map((explicitPoints, index) => (
        <Polyline
          key={index}
          paint={measurementGuidePaint}
          points={explicitPoints}
        />
      ))}
      {showSnap &&
        snapGuides.map((points, index) => (
          <Polyline key={index} paint={snapGuidePaint} points={points} />
        ))}
      {distanceMeasurements.map((item, index) => (
        <DistanceMeasurement
          key={index}
          bounds={item.bounds}
          distance={item.distance}
        />
      ))}
    </>
  );
}
