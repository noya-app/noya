import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ForwardedRef, forwardRef, memo } from 'react';
import styled from 'styled-components';
import { SketchPattern } from '../utils/sketchPattern';
import { FillPreviewBackground } from './FillPreviewBackground';

const Container = styled.button(({ theme }) => ({
  outline: 'none',
  padding: 0,
  width: '40px',
  height: '27px',
  borderRadius: '4px',
  overflow: 'hidden',
  border: 'none',
  boxShadow: `0 0 0 1px ${theme.colors.divider} inset`,
  background: 'transparent',
  '&:focus': {
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
  },
  position: 'relative',
}));

interface Props {
  id?: string;
  value?: Sketch.Color | Sketch.Gradient | SketchPattern;
}

export default memo(
  forwardRef(function FillInputField(
    { id, value, ...rest }: Props,
    ref: ForwardedRef<HTMLButtonElement>,
  ) {
    return (
      <Container ref={ref} id={id} {...rest}>
        <FillPreviewBackground value={value} />
      </Container>
    );
  }),
);
