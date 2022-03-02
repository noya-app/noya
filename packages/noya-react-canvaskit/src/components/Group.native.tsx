import React, { memo, PropsWithChildren } from 'react';
import {
  ClipOp,
  Drawing,
  useDrawing,
  skiaMatrix3,
} from '@shopify/react-native-skia';
import { processChildren } from '@shopify/react-native-skia/src/renderer/Host';

import { useCanvasKit } from 'noya-renderer';
import { AffineTransform } from 'noya-geometry';
import {
  Rect,
  PathNative,
  PaintNative,
  CanvasKitNative,
  ColorFilterNative,
  ImageFilterNative,
} from 'noya-native-canvaskit';

interface ClipProps {
  path: Rect | PathNative;
  op: ClipOp;
  antiAlias?: boolean;
}

interface GroupProps {
  opacity?: number;
  transform?: AffineTransform;
  clip?: ClipProps;
  colorFilter?: ColorFilterNative;
  imageFilter?: ImageFilterNative;
  backdropImageFilter?: ImageFilterNative;
}

const Group: React.FC<PropsWithChildren<GroupProps>> = (props) => {
  // @ts-ignore
  const CanvasKit = useCanvasKit() as typeof CanvasKitNative;

  const onDraw = useDrawing(
    props,
    (
      ctx,
      {
        opacity,
        transform,
        clip,
        colorFilter,
        imageFilter,
        backdropImageFilter,
      },
      children,
    ) => {
      const { canvas } = ctx;
      // If we need to apply effects to the group as a whole, we need
      // to draw the elements on a separate bitmap using `saveLayer`
      const needsLayer =
        (!!opacity && opacity < 1) ||
        colorFilter ||
        imageFilter ||
        backdropImageFilter;

      const restoreCount = canvas.save();

      if (clip) {
        if (clip.path instanceof PathNative) {
          canvas.clipPath(
            clip.path.getRNSPath(),
            clip.op,
            clip.antiAlias ?? true,
          );
        } else {
          canvas.clipRect(clip.path, clip.op, clip.antiAlias ?? true);
        }
      }

      if (transform) {
        const { m00, m01, m02, m10, m11, m12 } = transform;
        canvas.concat(
          skiaMatrix3([
            [m00, m01, m02],
            [m10, m11, m12],
            [0, 0, 1],
          ]),
        );
      }

      if (needsLayer) {
        const layerPaint = new CanvasKit.Paint() as PaintNative;

        if (opacity && opacity < 1) {
          layerPaint.setAlphaf(opacity);
        }

        if (colorFilter) {
          layerPaint.setColorFilter(colorFilter);
        }

        if (imageFilter) {
          layerPaint.setImageFilter(imageFilter);
        }

        canvas.saveLayer(
          layerPaint.getRNSkiaPaint(),
          null,
          backdropImageFilter?.getRNSImageFilter(),
        );
      }

      processChildren(ctx, children);
      canvas.restoreToCount(restoreCount);
    },
  );

  return <Drawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Group);
