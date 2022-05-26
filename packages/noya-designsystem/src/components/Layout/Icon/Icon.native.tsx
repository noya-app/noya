import React, { memo, useMemo } from 'react';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import { useTheme } from 'styled-components';

import { getIconColor } from './utils';
import icoMoonConfig from './selection.json';
import { IconProps } from './types';

const IconRenderer = createIconSetFromIcoMoon(
  icoMoonConfig,
  'icomoon',
  'icomoon.ttf',
);

const Icon: React.FC<IconProps> = ({
  name,
  size = 15,
  color,
  selected,
  highlighted,
}) => {
  const theme = useTheme();

  const iconColor = useMemo(() => {
    return getIconColor(theme, color, selected, highlighted);
  }, [theme, color, selected, highlighted]);

  return <IconRenderer name={name} size={size} color={iconColor} />;
};

export default memo(Icon);
