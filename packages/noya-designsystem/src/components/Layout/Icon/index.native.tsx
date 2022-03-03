import React from 'react';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import styled from 'styled-components';

import icoMoonConfig from 'app-mobile/assets/fonts/icomoon/selection.json';
import { IconProps } from './types';

const IconRenderer = createIconSetFromIcoMoon(
  icoMoonConfig,
  'icomoon',
  'icomoon.ttf',
);

const Icon: React.FC<IconProps> = ({ name, size = 16, color }) => {
  return <StyledIcon name={name} size={size} color={color} />;
};

export default React.memo(Icon);

const StyledIcon = styled(IconRenderer)<{ color?: string }>((p) => ({
  color: p.color ?? p.theme.colors.text,
}));
