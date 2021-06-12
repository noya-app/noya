import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { sketchColorToRgba } from 'noya-designsystem';
import { getGradientBackground } from 'noya-designsystem/src/utils/getGradientBackground';
import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { useColorPicker } from '../contexts/ColorPickerContext';
import { RgbaColor } from '../types';
import { rgbaToHsva } from '../utils/convert';
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

export interface PositionHsva {
  color: RgbaColor;
  pos: number;
}

const RGBA_MAX = { r: 256, g: 256, b: 256, a: 1 };

/**
 * Linearly compute the step size between start and end (not normalized)
 * @param {StepValue} start
 * @param {StepValue} end
 * @param {number} steps - number of desired steps
 * @return {StepValue}
 */
function stepize(start: RgbaColor, end: RgbaColor, steps: number) {
  let step: RgbaColor = RGBA_MAX;

  let key: keyof RgbaColor;
  for (key in start) {
    step[key] = steps === 0 ? 0 : (end[key] - start[key]) / steps;
  }

  return step;
}

/**
 * Compute the final step color
 * @param {StepValue} step - from `stepize`
 * @param {StepValue} start
 * @param {number} i - color index
 * @param {StepValue} max - rgba or hsva of maximum values for each channel
 * @return {StepValue}
 */
function interpolate(
  step: RgbaColor,
  start: RgbaColor,
  i: number,
  max: RgbaColor,
) {
  let color: RgbaColor = RGBA_MAX;

  let k: keyof RgbaColor;
  for (k in start) {
    if (start[k] && step[k]) {
      color[k] = step[k] * i + start[k];
      color[k] = color[k] < 0 ? color[k] + max[k] : color[k];
    }
  }

  return color;
}

function computeAt(stops: PositionHsva[], pos: number, max: RgbaColor) {
  let start, end;
  for (let i = 0, l = stops.length; i < l - 1; i++) {
    if (pos >= stops[i].pos && pos < stops[i + 1].pos) {
      start = stops[i];
      end = stops[i + 1];
      break;
    }
  }

  if (!start || !end) {
    start = end = stops[stops.length - 1];
  }

  const step = stepize(start.color, end.color, (end.pos - start.pos) * 100000);
  const color = interpolate(step, start.color, (pos - start.pos) * 100000, max);
  color.a = 1;
  return color;
}

export default memo(function Gradient({
  gradients,
  selectedStop,
  onSelectStop,
  onChangePosition,
  onAdd,
}: {
  gradients: Sketch.GradientStop[];
  selectedStop: number;
  onSelectStop: (index: number) => void;
  onChangePosition: (position: number) => void;
  onAdd: (value: RgbaColor, position: number) => void;
}) {
  const [, onChange] = useColorPicker();

  const [moving, setMoving] = useState(false);
  const handleMove = (interaction: Interaction) => {
    const posi = gradients.map((g, index) => ({
      color: sketchColorToRgba(g.color),
      pos: index === 0 ? 0 : index === 1 ? 1 : g.position,
    }));

    const color = computeAt(posi, interaction.left, RGBA_MAX);

    onChange(rgbaToHsva(color));
    onChangePosition(interaction.left);
  };

  const handleKey = (offset: Interaction) => {
    // Hue measured in degrees of the color circle ranging from 0 to 360
    //console.log('press');
  };

  const handleClick = (interaction: Interaction) => {
    // Saturation and brightness always fit into [0, 100] range
    if (moving) return;

    const posi = gradients.map((g, index) => ({
      color: sketchColorToRgba(g.color),
      pos: index === 0 ? 0 : index === 1 ? 1 : g.position,
    }));

    const color = computeAt(posi, interaction.left, RGBA_MAX);

    onAdd(color, interaction.left);
  };

  const isOnPoint = (interaction: Interaction) => {
    return gradients.some(
      (g) =>
        g.position + 0.04 < interaction.left &&
        g.position - 0.04 > interaction.left,
    );
  };

  const background = getGradientBackground(gradients);

  return (
    <Container background={background}>
      <Interactive
        onMove={handleMove}
        onKey={handleKey}
        onMoveChange={(moving: boolean) => setMoving(moving)}
        onClick={handleClick}
        isOnPoint={isOnPoint}
        aria-label="Gradient"
      >
        {gradients.map((g, index) => (
          <Pointer
            key={`gradients-point-${index}`}
            selected={index === selectedStop}
            left={g.position}
            onClick={() => {
              if (moving) return;
              onSelectStop(index);
              onChange(rgbaToHsva(sketchColorToRgba(g.color)));
            }}
          />
        ))}
      </Interactive>
    </Container>
  );
});
