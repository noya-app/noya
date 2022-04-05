import React, { memo, useMemo, useCallback } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components';

import { sketchColorToRgba } from '../utils/sketchColor';
import { interpolateRgba } from '../utils/interpolateRgba';
import { sketchColorToRgbaString } from '../utils/sketchColor';
import { Interactive } from './Interactive';
import type { Interaction } from './types';
import Pointer from './Pointer';
import type { GradientProps } from './types';

const Container = styled(LinearGradient)({
  height: 12,
  borderRadius: 6,
});

export default memo(function Gradient({
  gradients,
  selectedStop,
  onSelectStop,
  onChangePosition,
  onAdd,
  onDelete,
}: GradientProps) {
  const handleMove = useCallback(
    (interaction: Interaction) => {
      onChangePosition(interaction.left);
    },
    [onChangePosition],
  );

  const handleClick = useCallback(
    (interaction: number | Interaction) => {
      if (typeof interaction === 'number') {
        onSelectStop(interaction);
        return;
      }

      const gradient = gradients.map((g) => ({
        color: sketchColorToRgba(g.color),
        position: g.position,
      }));

      const color = interpolateRgba(gradient, interaction.left);
      onAdd(color, interaction.left);
    },
    [onSelectStop, gradients, onAdd],
  );

  const { colors, locations } = useMemo(() => {
    const colorArray: string[] = [];
    const locationArray: number[] = [];

    gradients.forEach((gradient) => {
      colorArray.push(sketchColorToRgbaString(gradient.color));
      locationArray.push(gradient.position);
    });

    return { colors: colorArray, locations: locationArray };
  }, [gradients]);

  return (
    <Interactive
      onMove={handleMove}
      onClick={handleClick}
      locations={locations}
    >
      <Container
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        colors={colors}
        locations={locations}
        pointerEvents="none"
      />
      {gradients.map((g, index) => (
        <Pointer
          key={`gradient=${index}`}
          selected={index === selectedStop}
          left={g.position}
        />
      ))}
    </Interactive>
  );
});
