import React, { memo, useMemo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { SkiaImage, SkiaPaint } from 'noya-native-canvaskit';
import { useCanvasKit } from 'noya-renderer';

interface ImageProps {
  paint: SkiaPaint;
  image: ArrayBuffer;
  rect: Float32Array;
}

const Image: React.FC<ImageProps> = (props) => {
  const { rect, paint } = props;

  const CanvasKit = useCanvasKit();

  const skiaImage = useMemo(() => {
    return CanvasKit.MakeImageFromEncoded(props.image) as SkiaImage;
  }, [CanvasKit, props.image]);

  const drawingProps = { rect, paint, image: skiaImage };

  const onDraw = useDrawing(
    drawingProps,
    ({ canvas }, { image, paint, rect }) => {
      canvas.drawImage(
        image.getImage(),
        rect[0],
        rect[1],
        paint.getRNSkiaPaint(),
      );
    },
  );

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...drawingProps} skipProcessing />;
};

export default memo(Image);
