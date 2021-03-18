import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { ForwardedRef, forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { sketchColorToRgbaString } from '../utils/sketchColor';

const Container = styled.button(({ theme, color }) => ({
  outline: 'none',
  width: '40px',
  height: '27px',
  borderRadius: '4px',
  border: '1px solid rgba(0,0,0,0.1)',
  backgroundColor: color,
  '&:focus': {
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
  },
}));

interface Props {
  id?: string;
  value: Sketch.Color;
}

export default forwardRef(function ColorInputField(
  { id, value, ...rest }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const colorString = useMemo(() => sketchColorToRgbaString(value), [value]);

  return <Container ref={ref} color={colorString} id={id} {...rest} />;
});
