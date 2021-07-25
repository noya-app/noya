import { AffineTransform, distance, Point } from 'noya-geometry';
import { useColorFill, useStroke } from 'noya-react-canvaskit';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { round } from 'noya-utils';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Polyline, Rect, Text } from '..';

const padding = {
  width: 6,
  height: 2,
};

export type DistanceMeasurementProps = {
  distance: number;
  midpoint: Point;
  orientation: 'vertical' | 'horizontal';
};

function DistanceMeasurement({
  distance,
  midpoint,
  orientation,
}: DistanceMeasurementProps) {
  const measurementColor = useTheme().colors.canvas.measurement;
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

  const paragraphSize = useMemo(
    () => ({
      width: paragraph.getMinIntrinsicWidth(),
      height: paragraph.getHeight(),
    }),
    [paragraph],
  );

  const labelRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        midpoint.x + padding.width,
        midpoint.y + padding.height,
        paragraphSize.width,
        paragraphSize.height,
      ),
    [
      CanvasKit,
      midpoint.x,
      midpoint.y,
      paragraphSize.width,
      paragraphSize.height,
    ],
  );

  const backgroundSize = useMemo(
    () => ({
      width: paragraphSize.width + padding.width * 2,
      height: paragraphSize.height + padding.height * 2,
    }),
    [paragraphSize.height, paragraphSize.width],
  );

  const backgroundRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        round(midpoint.x),
        round(midpoint.y),
        backgroundSize.width,
        backgroundSize.height,
      ),
    [midpoint.x, midpoint.y, backgroundSize, CanvasKit],
  );

  const backgroundFill = useColorFill(measurementColor);

  const transform = useMemo(() => {
    switch (orientation) {
      case 'vertical':
        return AffineTransform.translation(6, -backgroundSize.height / 2);
      case 'horizontal':
        return AffineTransform.translation(-backgroundSize.width / 2, 6);
    }
  }, [backgroundSize, orientation]);

  return (
    <Group transform={transform}>
      <Rect
        rect={backgroundRect}
        paint={backgroundFill}
        cornerRadius={backgroundSize.height / 2}
      />
      <Text rect={labelRect} paragraph={paragraph} />
    </Group>
  );
}

interface Props {
  measurement: [Point, Point];
}

export default function MeasurementGuide({ measurement }: Props) {
  const CanvasKit = useCanvasKit();
  const measurementColor = useTheme().colors.canvas.measurement;

  const extensionGuidePaint = new CanvasKit.Paint();
  extensionGuidePaint.setColor(CanvasKit.Color4f(0.52, 0.248, 1.0));
  extensionGuidePaint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
  extensionGuidePaint.setStyle(CanvasKit.PaintStyle.Stroke);
  extensionGuidePaint.setStrokeWidth(1);

  const measurementGuidePaint = useStroke({
    color: measurementColor,
    strokeWidth: 1,
  });

  const midpoint = useMemo(
    () => ({
      x: (measurement[0].x + measurement[1].x) / 2,
      y: (measurement[0].y + measurement[1].y) / 2,
    }),
    [measurement],
  );

  const orientation =
    measurement[0].x === measurement[1].x ? 'vertical' : 'horizontal';

  const alignedMeasurement = measurement.map((point) => ({
    x: round(point.x) + (orientation === 'vertical' ? 0.5 : 0),
    y: round(point.y) + (orientation === 'horizontal' ? 0.5 : 0),
  }));

  return (
    <>
      <Polyline paint={measurementGuidePaint} points={alignedMeasurement} />
      <DistanceMeasurement
        midpoint={midpoint}
        distance={distance(...measurement)}
        orientation={orientation}
      />
    </>
  );
}
