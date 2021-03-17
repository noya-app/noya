import { RgbaColor } from 'noya-colorpicker/src/types';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import styled from 'styled-components';
import { memo } from 'react';

const ColoredCircle = styled.div(({ theme, color }) => ({
  height: '50px',
  width: '50px',
  backgroundColor: color,
  borderRadius: '50%',
  borderColor: 'black',
}));

export default memo(function ColorSwatch({ value }: { value: Sketch.Color }) {
  const color: RgbaColor = {
    a: value.alpha,
    r: Math.round(value.red * 255),
    g: Math.round(value.green * 255),
    b: Math.round(value.blue * 255),
  };

  const colorString: string = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  return <ColoredCircle color={colorString} />;
});
