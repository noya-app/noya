import React, { memo, PropsWithChildren } from 'react';
import {
  ClipOp,
  Drawing,
  useDrawing,
  skiaMatrix3,
  IColorFilter,
  IImageFilter,
} from '@shopify/react-native-skia';
import { processChildren } from '@shopify/react-native-skia/src/renderer/Host';

import { useCanvasKit } from 'noya-renderer';
import { AffineTransform, LTRBArrayToRect } from 'noya-geometry';
import { SkiaPath, SkiaPaint, SkiaCanvasKit } from 'noya-native-canvaskit';

interface ClipProps {
  path: Float32Array | SkiaPath;
  op: ClipOp;
  antiAlias?: boolean;
}

interface GroupProps {
  opacity?: number;
  transform?: AffineTransform;
  clip?: ClipProps;
  colorFilter?: IColorFilter;
  imageFilter?: IImageFilter;
  backdropImageFilter?: IImageFilter;
}

const Group: React.FC<PropsWithChildren<GroupProps>> = (props) => {
  // @ts-ignore
  const CanvasKit = useCanvasKit() as typeof SkiaCanvasKit;

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
        if (clip.path instanceof Float32Array) {
          canvas.clipRect(
            LTRBArrayToRect(clip.path),
            clip.op,
            clip.antiAlias ?? true,
          );
        } else if (clip.path instanceof SkiaPath) {
          canvas.clipPath(
            clip.path.getRNSkiaPath(),
            clip.op,
            clip.antiAlias ?? true,
          );
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
        const layerPaint = new CanvasKit.Paint() as SkiaPaint;

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
          backdropImageFilter,
        );
      }

      processChildren(ctx, children);
      canvas.restoreToCount(restoreCount);
    },
  );

  return <Drawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Group);
