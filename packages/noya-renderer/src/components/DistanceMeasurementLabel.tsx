import {
  AffineTransform,
  distance,
  getLineOrientation,
  Point,
  Size,
} from '@noya-app/noya-geometry';
import { round } from '@noya-app/noya-utils';
import { SYSTEM_FONT_ID } from 'noya-fonts';
import { useColorFill } from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Rect, Text } from '../ComponentsContext';
import { useFontManager } from '../FontManagerContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { useZoom } from '../ZoomContext';

interface Props {
  points: [Point, Point];
}

export function DistanceMeasurementLabel({ points }: Props) {
  const zoomValue = useZoom();
  const padding = useMemo(
    (): Size => ({
      width: 6 / zoomValue,
      height: 2 / zoomValue,
    }),
    [zoomValue],
  );
  const text = round(distance(...points)).toString();

  const centerPoint = useMemo(
    () => ({
      x: round((points[0].x + points[1].x) / 2),
      y: round((points[0].y + points[1].y) / 2),
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
        fontFamilies: [SYSTEM_FONT_ID],
        letterSpacing: 0.2,
      },
    });

    const builder = CanvasKit.ParagraphBuilder.MakeFromFontProvider(
      paragraphStyle,
      fontManager.getTypefaceFontProvider(),
    );
    builder.addText(text);

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager, text]);

  const paragraphSize = useMemo(
    () => ({
      width: paragraph.getMinIntrinsicWidth() / zoomValue,
      height: paragraph.getHeight() / zoomValue,
    }),
    [paragraph, zoomValue],
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
      padding.width,
      padding.height,
      paragraphSize.width,
      paragraphSize.height,
    ],
  );

  const backgroundSize = useMemo(
    () => ({
      width: paragraphSize.width + padding.width * 2,
      height: paragraphSize.height + padding.height * 2,
    }),
    [padding.height, padding.width, paragraphSize.height, paragraphSize.width],
  );

  const backgroundRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        centerPoint.x,
        centerPoint.y,
        backgroundSize.width,
        backgroundSize.height,
      ),
    [centerPoint.x, centerPoint.y, backgroundSize, CanvasKit],
  );

  const backgroundFill = useColorFill(measurementColor);

  const transform = useMemo(() => {
    switch (orientation) {
      case 'vertical':
        return AffineTransform.translate(
          padding.width,
          -backgroundSize.height / 2,
        );
      case 'horizontal':
        return AffineTransform.translate(
          -backgroundSize.width / 2,
          padding.width,
        );
    }
  }, [padding.width, backgroundSize.height, backgroundSize.width, orientation]);

  return (
    <Group transform={transform}>
      <Rect
        rect={backgroundRect}
        paint={backgroundFill}
        cornerRadius={backgroundSize.height / 2}
      />
      <Group
        transform={AffineTransform.scale(1 / zoomValue, 1 / zoomValue, {
          // Scale with top left of background padding as origin
          x: centerPoint.x + padding.width,
          y: centerPoint.y + padding.height,
        })}
      >
        <Text rect={labelRect} paragraph={paragraph} />
      </Group>
    </Group>
  );
}
