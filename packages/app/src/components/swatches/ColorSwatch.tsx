import Sketch from '@sketch-hq/sketch-file-format-ts';
import { hsvaToRgbaString, rgbaToHsva } from 'noya-colorpicker';
import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { sketchColorToRgba } from 'noya-designsystem';

const ColoredCircle = styled.div(({ theme, color }) => ({
  height: '65px',
  width: '65px',
  backgroundColor: color,
  borderRadius: '50%',
  border: '1px solid rgba(0,0,0,0.1)',
}));

interface Props {
  value: Sketch.Color;
}

export default memo(function ColorSwatch({ value }: Props) {
  const colorString = useMemo(
    () => hsvaToRgbaString(rgbaToHsva(sketchColorToRgba(value))),
    [value],
  );

  return <ColoredCircle color={colorString} />;
});
