import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';

import { Layout } from 'noya-designsystem';
import type { LayerType } from './types';

const LayerIcon = memo(function LayerIcon({
  type,
  selected,
  variant,
}: {
  type: LayerType | 'line';
  selected?: boolean;
  variant?: 'primary';
}) {
  const colors = useTheme().colors;

  const color = useMemo(
    () =>
      variant && !selected
        ? colors[variant]
        : selected
        ? colors.iconSelected
        : colors.icon,
    [variant, selected, colors],
  );

  const name = useMemo(
    () =>
      ({
        bitmap: 'image',
        oval: 'circle',
        polygon: null,
        rectangle: 'square',
        shapeGroup: 'copy',
        shapePath: 'share-1',
        star: null,
        triangle: null,
        text: 'text',
        group: 'copy',
        symbolInstance: 'component-instance',
        page: null,
        artboard: 'frame',
        MSImmutableHotspotLayer: null,
        slice: 'group',
        symbolMaster: 'component-1',
        line: 'line',
      }[type]),
    [type],
  );

  if (!name) {
    return null;
  }

  return <Layout.Icon name={name} color={color} />;
});

export default LayerIcon;
