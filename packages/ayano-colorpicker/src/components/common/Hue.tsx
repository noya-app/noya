import React from 'react';
import styled from 'styled-components';
import { clamp } from '../../utils/clamp';
import { round } from '../../utils/round';
import { Interaction, Interactive } from './Interactive';
import { Pointer } from './Pointer';

const Container = styled.div(() => ({
  position: 'relative' as any,
  height: '8px',
  borderRadius: '8px',
  boxShadow: '0 0 0 1px rgba(0,0,0,0.2) inset',
  background: `linear-gradient(
    to right,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  )`,
  zIndex: 2,
}));

interface Props {
  hue: number;
  onChange: (newHue: { h: number }) => void;
}

const HueBase = ({ hue, onChange }: Props) => {
  const handleMove = (interaction: Interaction) => {
    onChange({ h: 360 * interaction.left });
  };

  const handleKey = (offset: Interaction) => {
    // Hue measured in degrees of the color circle ranging from 0 to 360
    onChange({
      h: clamp(hue + offset.left * 360, 0, 360),
    });
  };

  return (
    <Container>
      <Interactive
        onMove={handleMove}
        onKey={handleKey}
        aria-label="Hue"
        aria-valuetext={round(hue)}
      >
        <Pointer left={hue / 360} />
      </Interactive>
    </Container>
  );
};

export const Hue = React.memo(HueBase);
