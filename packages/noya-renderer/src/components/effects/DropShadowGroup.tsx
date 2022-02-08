import React, { memo, PropsWithChildren, useMemo } from 'react';

import Sketch from 'noya-file-format';
import { Primitives } from 'noya-state';
import { Group } from '../../contexts/ComponentsContext';
import { useCanvasKit } from '../../hooks/useCanvasKit';

interface Props {
  shadow: Sketch.Shadow;
}

const DropShadowGroup: React.FC<PropsWithChildren<Props>> = (props) => {
  const { shadow, children } = props;
  const CanvasKit = useCanvasKit();

  const imageFilter = useMemo(
    () =>
      CanvasKit.ImageFilter.MakeDropShadowOnly(
        shadow.offsetX,
        shadow.offsetY,
        shadow.blurRadius / 2,
        shadow.blurRadius / 2,
        Primitives.color(CanvasKit, shadow.color),
        null,
      ),
    [CanvasKit, shadow],
  );

  return <Group imageFilter={imageFilter}>{children}</Group>;
};

export default memo(DropShadowGroup);
