import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { sketchColorToRgbaString, sketchColorToRgba } from 'noya-designsystem';

// It has very basic bacground color preview.
const TextStylePrev = styled.span<{ size: number; backgroundColor: string }>(
  ({ color, size, backgroundColor }) => ({
    fontSize: size,
    backgroundColor: backgroundColor,
    height: '90%',
    width: '90%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: color,
    pointerEvents: 'none',
    userSelect: 'none',
  }),
);

interface Props {
  text: string;
  size: number;
  color: Sketch.Color;
}

export default memo(function TextStyle({ color, size, text }: Props) {
  const colorString = useMemo(() => sketchColorToRgbaString(color), [color]);
  const backgroundColor = useMemo(() => {
    const rbga = sketchColorToRgba(color);
    const Y = 0.2126 * rbga.r + 0.7152 * rbga.g + 0.0722 * rbga.b;
    return Y < 128 ? 'white' : 'black';
  }, [color]);

  return (
    <TextStylePrev
      color={colorString}
      size={size}
      backgroundColor={backgroundColor}
    >
      {text}
    </TextStylePrev>
  );
});
