import React, { memo, PropsWithChildren, useMemo } from 'react';

import Sketch from 'noya-file-format';
import { CanvasKit } from 'canvaskit';
import { toDegrees } from 'noya-geometry';
import { useCanvasKit } from '../../hooks/useCanvasKit';
import { Group } from '../../contexts/ComponentsContext';
import {
  getBrightnessMatrix,
  getContrastMatrix,
  getHueRotationMatrix,
  getSaturationMatrix,
} from '../../utils/colorMatrix';

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
}

const ColorControlsGroup: React.FC<PropsWithChildren<Props>> = (props) => {
  const { colorControls, children } = props;
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
};

export default memo(ColorControlsGroup);