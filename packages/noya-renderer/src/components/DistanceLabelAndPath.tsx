import {
  Polyline,
  Text,
  usePaint,
  useReactCanvasKit,
  useFontManager,
} from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { Point } from 'noya-state';

export default function DistanceLabelAndPath({
  labelText,
  labelOrigin,
  pathStartPoint,
  pathEndPoint,
}: {
  labelText: string;
  labelOrigin: Point;
  pathStartPoint: Point;
  pathEndPoint: Point;
}) {
  const { CanvasKit } = useReactCanvasKit();
  const fontManager = useFontManager();
  const paragraph = useMemo(() => {
    const paragraphStyle = new CanvasKit.ParagraphStyle({
      textStyle: {
        color: CanvasKit.parseColorString('ff0000'),
        fontSize: 11,
        fontFamilies: ['Roboto'],
        letterSpacing: 0.2,
      },
    });

    const builder = CanvasKit.ParagraphBuilder.Make(
      paragraphStyle,
      fontManager,
    );
    builder.addText(labelText);

    const paragraph = builder.build();
    paragraph.layout(10000);

    return paragraph;
  }, [CanvasKit, fontManager, labelText]);

  const labelRect = useMemo(
    () =>
      CanvasKit.XYWHRect(
        labelOrigin.x,
        labelOrigin.y,
        paragraph.getMinIntrinsicWidth(),
        paragraph.getHeight(),
      ),
    [CanvasKit, paragraph, labelOrigin.x, labelOrigin.y],
  );

  const points = [pathStartPoint, pathEndPoint];

  const stroke = usePaint({
    color: CanvasKit.Color(255, 69, 0, 0.9),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });

  return (
    <>
      <Text rect={labelRect} paragraph={paragraph} />
      <Polyline paint={stroke} points={points}></Polyline>
    </>
  );
}
