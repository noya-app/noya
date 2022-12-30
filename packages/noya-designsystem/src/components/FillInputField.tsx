import Sketch from 'noya-file-format';
import React, { CSSProperties, ForwardedRef, forwardRef, memo } from 'react';
import styled from 'styled-components';
import { SketchPattern } from '../utils/sketchPattern';
import { FillPreviewBackground } from './FillPreviewBackground';

const Container = styled.button<{ flex?: CSSProperties['flex'] }>(
  ({ theme, flex }) => ({
    outline: 'none',
    padding: 0,
    width: '50px',
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
    flex,
  }),
);

interface Props {
  id?: string;
  value?: Sketch.Color | Sketch.Gradient | SketchPattern;
  flex?: CSSProperties['flex'];
}

export const FillInputField = memo(
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
