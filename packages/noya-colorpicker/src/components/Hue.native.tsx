import React, { memo, useCallback } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components';

import { useColorPicker } from '../contexts/ColorPickerContext';
import { Interactive } from './Interactive';
import { Interaction } from './types';
import Pointer from './Pointer';

const Container = styled(LinearGradient)({
  height: 12,
  borderRadius: 6,
});

export default memo(function HueBase() {
  const [{ h: hue }, onChange] = useColorPicker();

  const handleMove = useCallback(
    (interaction: Interaction) => {
      onChange({ h: 360 * interaction.left });
    },
    [onChange],
  );

  return (
    <Interactive onMove={handleMove}>
      <Container
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        colors={['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00']}
        locations={[0, 0.17, 0.33, 0.5, 0.67, 0.83, 1]}
        pointerEvents="none"
      />
      <Pointer left={hue / 360} />
    </Interactive>
  );
});
