import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { sketchColorToRgbaString, sketchColorToRgba } from 'noya-designsystem';

// It has very basic bacground color preview.
export type SimpleTextDecoration = 'none' | 'underline' | 'strikethrough';

const TextStylePrev = styled.span<{
  size: number;
  backgroundColor: string;
  textTransform?: number;
  textDecoration: SimpleTextDecoration;
}>(({ color, size, textTransform, textDecoration, backgroundColor }) => ({
  fontSize: size,
  backgroundColor: backgroundColor,
  height: '90%',
  width: '90%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: color,
  textTransform:
    textTransform === 1
      ? 'uppercase'
      : textTransform === 2
      ? 'lowercase'
      : 'none',
  pointerEvents: 'none',
  userSelect: 'none',
  textDecoration:
    textDecoration === 'underline'
      ? 'underline'
      : textDecoration === 'strikethrough'
      ? 'line-through'
      : 'none',
}));
interface Props {
  text: string;
  size: number;
  color: Sketch.Color;
  textDecoration: SimpleTextDecoration;
  textTransform: Sketch.TextTransform | undefined;
}

export default memo(function TextStyle({
  color,
  size,
  text,
  textDecoration,
  textTransform,
}: Props) {
  const colorString = useMemo(() => sketchColorToRgbaString(color), [color]);
  const backgroundColor = useMemo(() => {
    const rbga = sketchColorToRgba(color);
    /*
      Formula found in this question 
      https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
      Source: https://en.wikipedia.org/wiki/Relative_luminance 
    */
    const Y = 0.2126 * rbga.r + 0.7152 * rbga.g + 0.0722 * rbga.b;
    return Y < 128 ? 'white' : 'black';
  }, [color]);

  return (
    <TextStylePrev
      color={colorString}
      size={size}
      textDecoration={textDecoration}
      backgroundColor={backgroundColor}
      textTransform={textTransform}
    >
      {text}
    </TextStylePrev>
  );
});
