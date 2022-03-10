import React, { memo } from 'react';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import { useTheme } from 'styled-components';

import icoMoonConfig from './selection.json';
import { IconProps } from './types';

const IconRenderer = createIconSetFromIcoMoon(
  icoMoonConfig,
  'icomoon',
  'icomoon.ttf',
);

const Icon: React.FC<IconProps> = ({ name, size = 12, color, selected }) => {
  const { icon: iconColor, iconSelected: iconSelectedColor } =
    useTheme().colors;

  return (
    <IconRenderer
      name={name}
      size={size}
      color={color ?? (selected ? iconSelectedColor : iconColor)}
    />
  );
};

export default memo(Icon);
