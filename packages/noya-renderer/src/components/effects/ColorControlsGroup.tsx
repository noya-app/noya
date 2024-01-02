import { Sketch } from '@noya-app/noya-file-format';
import { toDegrees } from '@noya-app/noya-geometry';
import { CanvasKit } from 'canvaskit';
import React, { memo, ReactNode, useMemo } from 'react';
import {
  getBrightnessMatrix,
  getContrastMatrix,
  getHueRotationMatrix,
  getSaturationMatrix,
} from '../../colorMatrix';
import { Group } from '../../ComponentsContext';
import { useCanvasKit } from '../../hooks/useCanvasKit';

function multiplyColorMatrix(
  CanvasKit: CanvasKit,
  [first, ...rest]: Float32Array[],
) {
  if (!first) return CanvasKit.ColorMatrix.identity();

  return rest.reduce(
    (result, item) => CanvasKit.ColorMatrix.concat(result, item),
    first,
  );
}

interface Props {
  colorControls: Sketch.ColorControls;
  children: ReactNode;
}

export default memo(function ColorControlsGroup({
  colorControls,
  children,
}: Props) {
  const CanvasKit = useCanvasKit();

  const colorFilter = useMemo(() => {
    const { isEnabled, hue, saturation, brightness, contrast } = colorControls;

    return isEnabled
      ? CanvasKit.ColorFilter.MakeMatrix(
          multiplyColorMatrix(CanvasKit, [
            getHueRotationMatrix(toDegrees(hue)),
            getSaturationMatrix(saturation),
            getBrightnessMatrix(brightness),
            getContrastMatrix(contrast),
          ]),
        )
      : undefined;
  }, [CanvasKit, colorControls]);

  return <Group colorFilter={colorFilter}>{children}</Group>;
});
