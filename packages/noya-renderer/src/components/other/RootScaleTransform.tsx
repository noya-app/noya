import React, { useMemo } from 'react';

import { AffineTransform } from 'noya-geometry';
import { Group } from '../../contexts/ComponentsContext';
import { useRootScale } from '../../contexts/RootScaleContext';

const RootScaleTransformGroup: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const rootScale = useRootScale();
  const rootScaleTransform = useMemo(
    () => AffineTransform.scale(rootScale),
    [rootScale],
  );

  return <Group transform={rootScaleTransform}>{children}</Group>;
};

export default RootScaleTransformGroup;
