import React, { memo } from 'react';
import { Interactive, Interaction } from './Interactive';
import Pointer from './Pointer';
import { HsvaColor } from '../types';
import { hsvaToHslString } from '../utils/convert';
import { clamp } from '../utils/clamp';
import { round } from '../utils/round';
import styled from 'styled-components';

const Container = styled.div<{ backgroundColor: string }>(
  ({ backgroundColor }) => ({
    position: 'relative',
    flexGrow: 1,
    borderRadius: '3px',
    backgroundColor,
    backgroundImage: [
      'linear-gradient(to top, #000, rgba(0, 0, 0, 0))',
      'linear-gradient(to right, #fff, rgba(255, 255, 255, 0))',
    ].join(', '),
    boxShadow: '0 0 0 1px rgba(0,0,0,0.2) inset',
    overflow: 'hidden',
  }),
);

interface Props {
  hsva: HsvaColor;
  onChange: (newColor: { s: number; v: number }) => void;
}

export default memo(function SaturationBase({ hsva, onChange }: Props) {
  const handleMove = (interaction: Interaction) => {
    onChange({
      s: interaction.left * 100,
      v: 100 - interaction.top * 100,
    });
  };

  const handleKey = (offset: Interaction) => {
    // Saturation and brightness always fit into [0, 100] range
    onChange({
      s: clamp(hsva.s + offset.left * 100, 0, 100),
      v: clamp(hsva.v - offset.top * 100, 0, 100),
    });
  };

  return (
    <Container
      backgroundColor={hsvaToHslString({ h: hsva.h, s: 100, v: 100, a: 1 })}
    >
      <Interactive
        onMove={handleMove}
        onKey={handleKey}
        aria-label="Color"
        aria-valuetext={`Saturation ${round(hsva.s)}%, Brightness ${round(
          hsva.v,
        )}%`}
      >
        <Pointer top={1 - hsva.v / 100} left={hsva.s / 100} />
      </Interactive>
    </Container>
  );
});
