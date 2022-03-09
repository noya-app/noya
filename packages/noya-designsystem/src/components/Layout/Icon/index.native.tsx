import React, { useMemo } from 'react';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import { useTheme } from 'styled-components';

import icoMoonConfig from 'app-mobile/assets/fonts/icomoon/selection.json';
import { IconProps } from './types';

const IconRenderer = createIconSetFromIcoMoon(
  icoMoonConfig,
  'icomoon',
  'icomoon.ttf',
);

// TODO: this function can be removed after
// renaming all of the icomoon icons to match web
function mapIconName(name: string): string {
  return (
    {
      LockClosedIcon: 'lock-closed',
      LockOpen1Icon: 'lock-open-1',
    }[name] ?? name
  );
}

const Icon: React.FC<IconProps> = ({ name, size = 16, color, selected }) => {
  const { icon: iconColor, iconSelected: iconSelectedColor } =
    useTheme().colors;

  const iconName = useMemo(() => {
    return mapIconName(name);
  }, [name]);

  return (
    <IconRenderer
      name={iconName}
      size={size}
      color={color ?? (selected ? iconSelectedColor : iconColor)}
    />
  );
};

export default React.memo(Icon);
