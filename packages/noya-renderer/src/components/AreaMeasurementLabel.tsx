import { Point, Size } from 'noya-geometry';
import { useColorFill } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import { round } from 'noya-utils';
import React, { useMemo } from 'react';
import { Rect, Text } from '..';
import { useTypefaceFontProvider } from '../FontManagerContext';

interface Props {
  origin: Point;
  text: string;
  fontSize?: number;
  padding?: Size;
}

export function AreaMeasurementLabel({
  origin,
  text,
  fontSize = 11,
  padding = {
    width: 6,
    height: 2,
  },
}: Props) {
  const CanvasKit = useCanvasKit();
  const typespaceFontProvider = useTypefaceFontProvider();

  const paragraph = useMemo(() => {
    const paragraphStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.parseColorString('rgb(255,255,225)'),
        fontSize,
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
  }, [CanvasKit, typespaceFontProvider, fontSize, text]);

  const paragraphSize = useMemo(
    () => ({
      width: paragraph.getMaxIntrinsicWidth(),
      height: paragraph.getHeight(),
    }),
    [paragraph],
  );

  const labelRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        origin.x + padding.width,
        origin.y + padding.height,
        paragraphSize.width,
        paragraphSize.height,
      ),
    [
      CanvasKit,
      origin.x,
      origin.y,
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
        round(origin.x),
        round(origin.y),
        backgroundSize.width,
        backgroundSize.height,
      ),
    [origin.x, origin.y, backgroundSize, CanvasKit],
  );

  const backgroundFill = useColorFill('rgb(80,80,80)');

  return (
    <>
      <Rect rect={backgroundRect} paint={backgroundFill} cornerRadius={4} />
      <Text rect={labelRect} paragraph={paragraph} />
    </>
  );
}
