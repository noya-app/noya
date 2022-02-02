import React, { memo, PropsWithChildren, useMemo } from 'react';

import Sketch from 'noya-file-format';
import { Path } from 'canvaskit';
import { useCanvasKit } from '../../hooks/useCanvasKit';
import { Group } from '../../contexts/ComponentsContext';
import { getSaturationMatrix } from '../../utils/colorMatrix';

interface Props {
  blur: Sketch.Blur;
  clippingPath?: Path;
}

const BlurGroup: React.FC<PropsWithChildren<Props>> = (props) => {
  const { blur, clippingPath, children } = props;
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

  if (!imageFilter) return <>{children}</>;

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
};

export default memo(BlurGroup);
