import React, { memo, useMemo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { SkiaImage, SkiaPaint } from 'noya-native-canvaskit';
import { LTRBArrayToRect } from 'noya-geometry';
import { useCanvasKit } from 'noya-renderer';

interface ImageProps {
  paint: SkiaPaint;
  image: ArrayBuffer;
  rect: Float32Array;
  resample?: boolean;
}

const Image: React.FC<ImageProps> = (props) => {
  const { rect, paint, resample } = props;

  const CanvasKit = useCanvasKit();

  const skiaImage = useMemo(() => {
    const image = CanvasKit.MakeImageFromEncoded(props.image) as SkiaImage;

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
      const destRect = LTRBArrayToRect(rect);

      if (resample) {
        canvas.drawImageRectCubic(
          image.getImage(),
          srcRect,
          destRect,
          1 / 3,
          1 / 3,
          paint.getRNSkiaPaint(),
        );
      } else {
        canvas.drawImageRect(
          image.getImage(),
          srcRect,
          destRect,
          paint.getRNSkiaPaint(),
        );
      }
    },
  );

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...drawingProps} skipProcessing />;
};

export default memo(Image);
