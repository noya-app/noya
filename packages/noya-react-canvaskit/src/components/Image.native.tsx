import React, { memo, useMemo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { PaintNative, CanvasKitNative, Rect } from 'noya-native-canvaskit';
import { useCanvasKit } from 'noya-renderer';

interface ImageProps {
  paint: PaintNative;
  image: ArrayBuffer;
  rect: Rect;
  resample?: boolean;
}

const Image: React.FC<ImageProps> = (props) => {
  const { rect, paint, resample } = props;
  const CanvasKit = useCanvasKit() as unknown as typeof CanvasKitNative;

  const skiaImage = useMemo(() => {
    const image = CanvasKit.MakeImageFromEncoded(props.image)!;

    return image;
  }, [CanvasKit, props.image]);

  const drawingProps = { rect, paint, image: skiaImage, resample };

  const onDraw = useDrawing(
    drawingProps,
    ({ canvas }, { image, paint, rect, resample }) => {
      const srcRect = {
        x: 0,
        y: 0,
        width: image.width(),
        height: image.height(),
      };

      if (resample) {
        canvas.drawImageRectCubic(
          image.getRNSImage(),
          srcRect,
          rect,
          1 / 3,
          1 / 3,
          paint.getRNSkiaPaint(),
        );
      } else {
        canvas.drawImageRect(
          image.getRNSImage(),
          srcRect,
          rect,
          paint.getRNSkiaPaint(),
        );
      }
    },
  );

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...drawingProps} skipProcessing />;
};

export default memo(Image);
