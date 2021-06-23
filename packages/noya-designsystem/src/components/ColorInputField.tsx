import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ForwardedRef, forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { sketchColorToRgbaString } from '../utils/sketchColor';
import { getGradientBackground } from '../utils/getGradientBackground';
import { getPatternBackground, SketchPattern } from '../utils/sketchPattern';
import { useApplicationState } from '../../../app/src/contexts/ApplicationStateContext';

const Container = styled.button<{
  background: string;
  backgroundSize?: string;
}>(({ theme, background }) => ({
  outline: 'none',
  width: '40px',
  height: '27px',
  borderRadius: '4px',
  border: '1px solid rgba(0,0,0,0.1)',
  background,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  '&:focus': {
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
  },
}));

interface Props {
  id?: string;
  value: Sketch.Color | Sketch.Gradient | SketchPattern;
}

export default forwardRef(function ColorInputField(
  { id, value, ...rest }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const [state] = useApplicationState();

  const background = useMemo(() => {
    switch (value._class) {
      case 'color':
        return sketchColorToRgbaString(value);
      case 'gradient':
        return getGradientBackground(value.stops, value.gradientType, 180);
      case 'pattern': {
        const bg = getPatternBackground(state.sketch.images, value);
        return bg ? bg.background : 'rgba(200,200,200,0.8)';
      }
    }
  }, [value, state.sketch.images]);

  return <Container ref={ref} background={background} id={id} {...rest} />;
});
