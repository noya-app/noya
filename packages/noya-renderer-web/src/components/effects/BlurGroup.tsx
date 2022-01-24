import Sketch from 'noya-file-format';
import * as CanvasKit from 'canvaskit';
import { Group, useCanvasKit } from 'noya-renderer-web';
import { memo, ReactNode, useMemo } from 'react';
import { getSaturationMatrix } from '../../colorMatrix';

type Props = {
  blur: Sketch.Blur;
  clippingPath?: CanvasKit.Path;
  children: ReactNode;
};

export default memo(function BlurGroup({
  blur,
  clippingPath,
  children,
}: Props) {
  const CanvasKit = useCanvasKit();

  const imageFilter = useMemo(() => {
    if (!blur.isEnabled) return;

    const radius = blur.radius ?? 0;

    // The blur is different from Sketch. Multiplying radius by `1.2` gets pretty close
    const blurFilter = CanvasKit.ImageFilter.MakeBlur(
      radius * 1.2,
      radius * 1.2,
      CanvasKit.TileMode.Clamp,
      null,
    );

    if (blur.type === Sketch.BlurType.Background && blur.saturation !== 1) {
      const colorFilter = CanvasKit.ImageFilter.MakeColorFilter(
        CanvasKit.ColorFilter.MakeMatrix(getSaturationMatrix(blur.saturation)),
        blurFilter,
      );

      return colorFilter;
    } else {
      if (radius === 0) return;

      return blurFilter;
    }
  }, [CanvasKit, blur.isEnabled, blur.radius, blur.saturation, blur.type]);

  const clip = useMemo(
    () =>
      blur.isEnabled && blur.type === Sketch.BlurType.Background && clippingPath
        ? { op: CanvasKit.ClipOp.Intersect, path: clippingPath }
        : undefined,
    [CanvasKit.ClipOp.Intersect, blur.isEnabled, blur.type, clippingPath],
  );

  if (!imageFilter) return children;

  return (
    <Group
      imageFilter={
        blur.isEnabled && blur.type === Sketch.BlurType.Gaussian
          ? imageFilter
          : undefined
      }
      backdropImageFilter={
        blur.isEnabled && blur.type === Sketch.BlurType.Background
          ? imageFilter
          : undefined
      }
      clip={clip}
    >
      {children}
    </Group>
  );
});
