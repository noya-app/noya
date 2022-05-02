import React, { memo, PropsWithChildren, useMemo } from 'react';
import { ClipOp, createDrawing } from '@shopify/react-native-skia';

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

type OnDrawProps = GroupProps & {
  CanvasKit: typeof CanvasKitNative;
};

const onDraw = createDrawing<OnDrawProps>(function onDraw(
  ctx,
  {
    clip,
    opacity,
    CanvasKit,
    transform,
    colorFilter,
    imageFilter,
    backdropImageFilter,
  },
  node,
) {
  const { canvas } = ctx;
  const restoreCount = canvas.save();

  // If we need to apply effects to the group as a whole, we need
  // to draw the elements on a separate bitmap using `saveLayer`
  const needsLayer =
    (opacity !== undefined && opacity < 1) ||
    colorFilter ||
    imageFilter ||
    backdropImageFilter;

  if (clip) {
    if (clip.path instanceof PathNative) {
      canvas.clipPath(clip.path.getRNSPath(), clip.op, clip.antiAlias ?? true);
    } else {
      canvas.clipRect(clip.path, clip.op, clip.antiAlias ?? true);
    }
  }

  if (transform) {
    const { m00, m01, m02, m10, m11, m12 } = transform;

    canvas.concat([m00, m01, m02, m10, m11, m12, 0, 0, 1]);
  }

  if (needsLayer) {
    const layerPaint = new CanvasKit.Paint() as PaintNative;

    if (opacity !== undefined && opacity < 1) {
      layerPaint.setAlphaf(opacity);
    }

    if (colorFilter) {
      layerPaint.setColorFilter(colorFilter);
    }

    console.log(imageFilter);

    if (imageFilter) {
      layerPaint.setImageFilter(imageFilter);
    }

    canvas.saveLayer(
      layerPaint.getRNSkiaPaint(),
      null,
      backdropImageFilter?.getRNSImageFilter(),
    );
  }

  node.visit(ctx, node.children);
  canvas.restoreToCount(restoreCount);
});

const Group: React.FC<PropsWithChildren<GroupProps>> = ({
  opacity,
  transform,
  clip,
  children,
  colorFilter,
  imageFilter,
  backdropImageFilter,
}) => {
  const CanvasKit = useCanvasKit();

  const stableProps = useMemo(
    () => ({
      clip,
      opacity,
      children,
      CanvasKit,
      transform,
      colorFilter,
      imageFilter,
      backdropImageFilter,
    }),
    [
      clip,
      children,
      opacity,
      CanvasKit,
      transform,
      colorFilter,
      imageFilter,
      backdropImageFilter,
    ],
  );

  return <skDrawing onDraw={onDraw} {...stableProps} skipProcessing />;
};

export default memo(Group);
