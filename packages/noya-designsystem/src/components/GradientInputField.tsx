import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ForwardedRef, forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { getGradientBackground } from '../utils/getGradientBackground';

const Container = styled.button<{ background: string }>(
  ({ theme, background }) => ({
    outline: 'none',
    width: '40px',
    height: '27px',
    borderRadius: '4px',
    border: '1px solid rgba(0,0,0,0.1)',
    background,
    '&:focus': {
      boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
    },
  }),
);

interface Props {
  id?: string;
  value: Sketch.Gradient;
}

export default forwardRef(function ColorInputField(
  { id, value, ...rest }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const background = useMemo(
    () => getGradientBackground(value.stops, value.gradientType),
    [value],
  );

  return <Container ref={ref} background={background} id={id} {...rest} />;
});
