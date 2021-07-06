import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
import { toDegrees } from 'noya-geometry';
import { useReactCanvasKit } from 'noya-react-canvaskit';
import { memo, ReactNode, useMemo } from 'react';
import { Group } from '../..';
import {
  getBrightnessMatrix,
  getContrastMatrix,
  getHueRotationMatrix,
  getSaturationMatrix,
} from '../../colorMatrix';

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
  const { CanvasKit } = useReactCanvasKit();

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
