import React, { useEffect, useState } from 'react';
import {
  Image as SkiaImage,
  Group as SkiaGroup,
  ImageCtor,
  IImage,
} from '@shopify/react-native-skia';

import { Image } from '../../types';

interface ImageProps {
  image: Image;
}

const ImageElement: React.FC<ImageProps> = (props) => {
  const { image } = props;
  const [imageSource, setImageSource] = useState<IImage | null>(null);

  // Note:
  // react-native-skia has useImage hook which returns IImage
  // based on react-native image source objects (different than require)
  // but using it causes infinite re-render loop
  useEffect(() => {
    (async () => {
      const asset = await ImageCtor({ uri: image.source });

      setImageSource(asset);
    })();
  }, [image.source]);

  if (!imageSource) {
    return null;
  }

  // TODO: figure out how to draw the selection box
  return (
    <SkiaGroup>
      <SkiaImage
        x={image.position.x}
        y={image.position.y}
        fit={image.fit}
        width={image.size.width}
        height={image.size.height}
        source={imageSource}
      />
    </SkiaGroup>
  );
};

export default React.memo(ImageElement);
