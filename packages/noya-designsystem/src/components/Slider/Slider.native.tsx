import React, { memo } from 'react';
import RNSlider from '@react-native-community/slider';
import styled, { useTheme } from 'styled-components';

import type { SliderProps } from './types';

const StyledSlider = styled(RNSlider)({
  flex: 1,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  height: 16,
});

function Slider({ value, onValueChange, min, max }: SliderProps) {
  const theme = useTheme();

  return (
    <StyledSlider
      minimumValue={min}
      maximumValue={max}
      value={value}
      onValueChange={onValueChange}
      maximumTrackTintColor={theme.colors.divider}
      minimumTrackTintColor={theme.colors.primary}
      thumbTintColor={theme.colors.slider.background}
    />
  );
}

export default memo(Slider);
