import React, { memo } from 'react';
import { Drawing, useDrawing } from '@shopify/react-native-skia';

import { SkiaImage, SkiaPaint } from 'noya-native-canvaskit';

interface ImageProps {
  paint: SkiaPaint;
  // image: ArrayBuffer;
  image: SkiaImage;
  rect: Float32Array;
}

const Image: React.FC<ImageProps> = (props) => {
  const onDraw = useDrawing(props, ({ canvas }, { image, paint, rect }) => {
    // const data = Skia.Data.fromBytes(new Uint8Array(image));
    // const img = Skia.MakeImageFromEncoded(data);

    // if (!img) {
    //   return;
    // }

    canvas.drawImage(
      image.getImage(),
      rect[0],
      rect[1],
      paint.getRNSkiaPaint(),
    );
  });

  // @ts-ignore
  return <Drawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Image);
