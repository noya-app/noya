import {
  AffineTransform,
  distance,
  getLineOrientation,
  Point,
} from 'noya-geometry';
import { useColorFill } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import { round } from 'noya-utils';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Rect, Text } from '..';
import { useTypefaceFontProvider } from '../FontManagerContext';

const PADDING = {
  width: 6,
  height: 2,
};

interface Props {
  points: [Point, Point];
}

export function DistanceMeasurementLabel({ points }: Props) {
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
  const typespaceFontProvider = useTypefaceFontProvider();

  const paragraph = useMemo(() => {
    const paragraphStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.parseColorString('rgb(255,255,225)'),
        fontSize: 11,
        fontFamilies: ['system'],
        letterSpacing: 0.2,
      },
    });

    const builder = CanvasKit.ParagraphBuilder.MakeFromFontProvider(
      paragraphStyle,
      typespaceFontProvider,
    );
    builder.addText(text);

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, typespaceFontProvider, text]);

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
        centerPoint.x + PADDING.width,
        centerPoint.y + PADDING.height,
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
      width: paragraphSize.width + PADDING.width * 2,
      height: paragraphSize.height + PADDING.height * 2,
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
        return AffineTransform.translate(6, -backgroundSize.height / 2);
      case 'horizontal':
        return AffineTransform.translate(-backgroundSize.width / 2, 6);
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
