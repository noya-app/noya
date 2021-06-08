import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { getGradientBackground } from 'noya-designsystem/src/utils/getGradientBackground';
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { useColorPicker } from '../contexts/ColorPickerContext';
import { Interaction, Interactive } from './GradientSlider';
import Pointer from './Pointer';

const Container = styled.div<{ background: string }>(({ background }) => ({
  position: 'relative' as any,
  height: '8px',
  borderRadius: '8px',
  boxShadow: '0 0 0 1px rgba(0,0,0,0.2) inset',
  background,
  zIndex: 2,
}));

export default memo(function Gradient({
  gradients,
}: {
  gradients: Sketch.GradientStop[];
}) {
  const [, onChange] = useColorPicker();

  const [selectedPosition, setSelectedPosition] = useState(0);

  const handleMove = (interaction: Interaction) => {
    //This is not right yet
    onChange(
      {
        h: 360 * interaction.left,
        s: interaction.left * 100,
        v: 100 - interaction.top * 100,
      },
      selectedPosition,
      interaction.left,
    );
  };

  const handleKey = (offset: Interaction) => {
    // Hue measured in degrees of the color circle ranging from 0 to 360
    //console.log('press');
  };

  const background = getGradientBackground(gradients);

  return (
    <Container background={background}>
      <Interactive onMove={handleMove} onKey={handleKey} aria-label="Gradient">
        {gradients.map((g, index) => (
          <Pointer
            key={`gradients-point-${index}`}
            selected={index === selectedPosition}
            left={g.position}
            onClick={() => setSelectedPosition(index)}
          />
        ))}
      </Interactive>
    </Container>
  );
});
