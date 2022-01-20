import React from 'react';
import { Path as SkiaPath, Skia } from '@shopify/react-native-skia';

import { Path } from '../../types';

interface PathProps {
  path: Path;
}

const PathElement: React.FC<PathProps> = (props) => {
  const { path } = props;

  const pathPoints = (() => {
    const skiaPath = Skia.Path.Make();

    path.points.forEach((point, idx) => {
      if (idx === 0) {
        skiaPath.moveTo(point.x as number, point.y as number);
      } else {
        skiaPath.lineTo(point.x as number, point.y as number);
      }
    });

    if (path.closed) {
      skiaPath.close();
    }

    return skiaPath;
  })();

  return (
    <SkiaPath
      path={pathPoints}
      color={path.color || 'lightblue'}
      style="stroke" // eslint-disable-line
      strokeWidth={path.width || 2}
    />
  );
};

export default PathElement;
