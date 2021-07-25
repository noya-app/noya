import {
  AffineTransform,
  distance,
  getLineOrientation,
  Point,
} from 'noya-geometry';
import { useColorFill, useDeletable } from 'noya-react-canvaskit';
import { useCanvasKit, useFontManager } from 'noya-renderer';
import { round } from 'noya-utils';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Polyline, Rect, Text } from '..';
import { pixelAlignPoints } from '../pixelAlignment';

const padding = {
  width: 6,
  height: 2,
};

export type MeasurementLabelProps = {
  points: [Point, Point];
};

export function MeasurementLabel({ points }: MeasurementLabelProps) {
  const text = round(distance(...points)).toString();

  const centerPoint = useMemo(
    () => ({
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    }),
    [points],
  );

  const orientation = getLineOrientation(points);

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
    builder.addText(text);

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager, text]);

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
        centerPoint.x + padding.width,
        centerPoint.y + padding.height,
        paragraphSize.width,
        paragraphSize.height,
      ),
    [
      CanvasKit,
      centerPoint.x,
      centerPoint.y,
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
        round(centerPoint.x),
        round(centerPoint.y),
        backgroundSize.width,
        backgroundSize.height,
      ),
    [centerPoint.x, centerPoint.y, backgroundSize, CanvasKit],
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
  points: [Point, Point];
}

export function MeasurementGuide({ points }: Props) {
  const CanvasKit = useCanvasKit();
  const measurementColor = useTheme().colors.canvas.measurement;

  const paint = useMemo(() => {
    const paint = new CanvasKit.Paint();
    paint.setColor(CanvasKit.parseColorString(measurementColor));
    paint.setPathEffect(CanvasKit.PathEffect.MakeDash([1, 2]));
    paint.setStyle(CanvasKit.PaintStyle.Stroke);
    paint.setStrokeWidth(1);
    return paint;
  }, [CanvasKit, measurementColor]);

  useDeletable(paint);

  const alignedMeasurement = useMemo(() => pixelAlignPoints(points), [points]);

  return <Polyline paint={paint} points={alignedMeasurement} />;
}
