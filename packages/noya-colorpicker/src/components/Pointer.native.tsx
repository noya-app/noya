import React, { memo, useContext } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

import { PointerProps } from './types';
import { InteractiveContext } from './Interactive.native';

const PointerBase = styled(View)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: selected ? theme.colors.primary : 'white',
    position: 'absolute',
    top: -8,
    left: -8,
  }),
);

export default memo(function Pointer({ top, left, selected }: PointerProps) {
  const size = useContext(InteractiveContext);

  return (
    <PointerBase
      pointerEvents="none"
      selected={selected}
      style={[
        top === undefined && { top: size.height / 2 - 8 },
        left === undefined && { left: size.width / 2 - 8 },
        {
          transform: [
            { translateY: (top ?? 0) * size.height },
            { translateX: (left ?? 0) * size.width },
          ],
        },
      ]}
    />
  );
});
