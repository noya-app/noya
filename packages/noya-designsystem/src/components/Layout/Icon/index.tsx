import React, { memo } from 'react';
import { useTheme } from 'styled-components';

import * as Icons from 'noya-icons';
import { IconProps } from './types';

const Icon: React.FC<IconProps> = ({ name, color, size, selected }) => {
  const { icon: iconColor, iconSelected: iconSelectedColor } =
    useTheme().colors;

  const Icon = Icons[name as keyof typeof Icons];

  return (
    <Icon
      color={color ?? (selected ? iconSelectedColor : iconColor)}
      {...(size && { width: size, height: size })}
    />
  );
};

export default memo(Icon);
