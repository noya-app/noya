import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { sketchColorToRgba } from 'noya-designsystem';
import { getGradientBackground } from 'noya-designsystem/src/utils/getGradientBackground';
import React, { memo, useMemo } from 'react';
import styled from 'styled-components';
import { colorAt, RGBA_MAX } from '../utils/colorAt';
import { RgbaColor } from '../types';
import { Interaction, Interactive } from './Interactive';
import Pointer from './Pointer';

const Container = styled.div<{ background: string }>(({ background }) => ({
  position: 'relative',
  height: '8px',
  borderRadius: '8px',
  boxShadow: '0 0 0 1px rgba(0,0,0,0.2) inset',
  background,
  zIndex: 2,
}));

export default memo(function Gradient({
  gradients,
  selectedStop,
  onSelectStop,
  onChangePosition,
  onAdd,
  onDelete,
}: {
  gradients: Sketch.GradientStop[];
  selectedStop: number;
  onSelectStop: (index: number) => void;
  onChangePosition: (position: number) => void;
  onAdd: (value: RgbaColor, position: number) => void;
  onDelete: () => void;
}) {
  const handleMove = (interaction: Interaction) => {
    onChangePosition(interaction.left);
  };

  const handleKey = (offset?: Interaction) => {
    if (!offset) {
      onDelete();
    }
    // Hue measured in degrees of the color circle ranging from 0 to 360
    //console.log('press');
  };

  const handleClick = (interaction: Interaction | number) => {
    if (typeof interaction === 'number') {
      onSelectStop(interaction);
      return;
    }

    const gradient = gradients.map((g, index) => ({
      color: sketchColorToRgba(g.color),
      pos: index === 0 ? 0 : index === 1 ? 1 : g.position,
    }));

    const color = colorAt(gradient, interaction.left, RGBA_MAX);

    onAdd(color, interaction.left);
  };

  const background = useMemo(() => getGradientBackground(gradients), [
    gradients,
  ]);
  return (
    <Container background={background}>
      <Interactive
        onMove={handleMove}
        onKey={handleKey}
        onClick={handleClick}
        aria-label="Gradient"
      >
        {gradients.map((g, index) => (
          <Pointer
            key={`gradients-point-${index}`}
            index={index}
            selected={index === selectedStop}
            onClick={() => onSelectStop(index)}
            left={g.position}
          />
        ))}
      </Interactive>
    </Container>
  );
});
