import React, { memo, useCallback } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components';

import { useColorPicker } from '../contexts/ColorPickerContext';
import { hsvaToHslString } from '../utils/convert';
import { Interactive } from './Interactive';
import type { Interaction } from './types';
import Pointer from './Pointer';

const Gradient = styled(LinearGradient)({
  borderRadius: 4,
  overflow: 'hidden',
  minHeight: 150,
});

export default memo(function SaturationBase() {
  const [hsva, onChange] = useColorPicker();

  const handleMove = useCallback(
    (interaction: Interaction) => {
      onChange({
        s: interaction.left * 100,
        v: 100 - interaction.top * 100,
      });
    },
    [onChange],
  );

  return (
    <Interactive onMove={handleMove}>
      <Gradient
        style={{
          backgroundColor: hsvaToHslString({ h: hsva.h, s: 100, v: 100, a: 1 }),
        }}
        colors={['#fff', 'rgba(255, 255, 255, 0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        pointerEvents="none"
      >
        <Gradient colors={['rgba(0, 0, 0, 0)', '#000']} />
      </Gradient>
      <Pointer top={1 - hsva.v / 100} left={hsva.s / 100} />
    </Interactive>
  );
});
