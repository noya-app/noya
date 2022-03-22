import * as RadixSlider from '@radix-ui/react-slider';
import { useCallback, useMemo, memo } from 'react';
import styled from 'styled-components';

import type { SliderProps } from './types';

const StyledSlider = styled(RadixSlider.Root)({
  flex: '1',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  height: '16px',
});

const StyledTrack = styled(RadixSlider.Track)(({ theme }) => ({
  backgroundColor: theme.colors.divider,
  position: 'relative',
  flexGrow: 1,
  height: '2px',
}));

const StyledRange = styled(RadixSlider.Range)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: theme.colors.primary,
  borderRadius: '9999px',
  height: '100%',
}));

const StyledThumb = styled(RadixSlider.Thumb)(({ theme }) => ({
  display: 'block',
  width: '12px',
  height: '12px',
  backgroundColor: theme.colors.slider.background,
  border: `1px solid ${theme.colors.slider.border}`,
  borderRadius: '20px',
  ':focus': {
    outline: 'none',
  },
}));

function Slider({ id, value, onValueChange, min, max }: SliderProps) {
  const arrayValue = useMemo(
    () => [Math.min(Math.max(value, min), max)],
    [value, min, max],
  );

  const handleValueChange = useCallback(
    (arrayValue: number[]) => {
      onValueChange(arrayValue[0]);
    },
    [onValueChange],
  );

  return (
    <StyledSlider
      min={min}
      max={max}
      id={id}
      value={arrayValue}
      onValueChange={handleValueChange}
    >
      <StyledTrack>
        <StyledRange />
      </StyledTrack>
      <StyledThumb />
    </StyledSlider>
  );
}

export default memo(Slider);
