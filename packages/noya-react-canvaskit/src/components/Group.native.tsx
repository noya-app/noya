import React, { memo, PropsWithChildren } from 'react';
import {
  Drawing,
  Skia,
  useDrawing,
  selectPaint,
  processPaint,
  skiaMatrix3,
  TileMode,
} from '@shopify/react-native-skia';
import { processChildren } from '@shopify/react-native-skia/src/renderer/Host';

import { useCanvasKit } from 'noya-renderer';
import { AffineTransform, LTRBArrayToRect } from 'noya-geometry';
import {
  SkiaPath,
  SkiaPaint,
  SkiaColorFilter,
  SkiaImageFilter,
} from 'noya-native-canvaskit';

import { ClipProps } from '../types';

interface GroupProps {
  opacity?: number;
  transform?: AffineTransform;
  clip?: ClipProps;
  colorFilter?: SkiaColorFilter;
  imageFilter?: SkiaImageFilter;
  backdropImageFilter?: SkiaImageFilter;
}

const Group: React.FC<PropsWithChildren<GroupProps>> = (props) => {
  const CanvasKit = useCanvasKit();

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
      const paint = selectPaint(ctx.paint, { opacity });
      processPaint(paint, ctx.opacity, { opacity });

      canvas.save();

      if (clip) {
        if (clip.path instanceof Float32Array) {
          canvas.clipRect(
            LTRBArrayToRect(clip.path),
            clip.op.value,
            clip.antiAlias ?? true,
          );
        } else if (clip.path instanceof SkiaPath) {
          canvas.clipPath(
            clip.path.getRNSkiaPath(),
            clip.op.value,
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

      // If we need to apply effects to the group as a whole, we need
      // to draw the elements on a separate bitmap using `saveLayer`
      const needsLayer =
        (!!opacity && opacity < 1) ||
        colorFilter ||
        imageFilter ||
        backdropImageFilter;

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
          backdropImageFilter?.getImageFilter(),
        );
      }

      processChildren(
        {
          ...ctx,
          paint,
          opacity: opacity ? opacity * ctx.opacity : ctx.opacity,
        },
        children,
      );

      canvas.restore();
    },
  );

  return <Drawing onDraw={onDraw} {...props} skipProcessing />;
};

export default memo(Group);
