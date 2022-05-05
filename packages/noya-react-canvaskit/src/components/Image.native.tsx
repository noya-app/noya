import React, { memo, useMemo } from 'react';
import { createDrawing } from '@shopify/react-native-skia';

import {
  PaintNative,
  CanvasKitNative,
  Rect,
  ImageNative,
} from 'noya-native-canvaskit';
import { useCanvasKit } from 'noya-renderer';

interface ImageProps {
  paint: PaintNative;
  image: ArrayBuffer;
  rect: Rect;
  resample?: boolean;
}

interface OnDrawProps {
  rect: Rect;
  image: ImageNative;
  paint: PaintNative;
  resample?: boolean;
  CanvasKit: typeof CanvasKitNative;
}

const onDraw = createDrawing<OnDrawProps>(function onDraw(
  { canvas },
  { image, paint, rect, resample, CanvasKit },
) {
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
});

const Image: React.FC<ImageProps> = (props) => {
  const { rect, paint, resample } = props;
  const CanvasKit = useCanvasKit() as unknown as typeof CanvasKitNative;

  const skiaImage = useMemo(() => {
    const image = CanvasKit.MakeImageFromEncoded(props.image)!;

    return image;
  }, [CanvasKit, props.image]);

  const drawingProps = { rect, paint, image: skiaImage, resample };

  return <skDrawing onDraw={onDraw} {...drawingProps} skipProcessing />;
};

export default memo(Image);
