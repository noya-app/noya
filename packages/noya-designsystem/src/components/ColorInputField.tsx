import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ForwardedRef, forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import { sketchColorToRgbaString } from '../utils/sketchColor';
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

export type SketchPattern = {
  _class: 'pattern';
  image?: Sketch.FileRef | Sketch.DataRef;
  patternFillType: Sketch.PatternFillType;
  patternTileScale: number;
};

interface Props {
  id?: string;
  value: Sketch.Color | Sketch.Gradient | SketchPattern;
}

export default forwardRef(function ColorInputField(
  { id, value, ...rest }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const background = useMemo(() => {
    switch (value._class) {
      case 'color':
        return sketchColorToRgbaString(value);
      case 'gradient':
        return getGradientBackground(value.stops, value.gradientType, 180);
      case 'pattern':
        return 'rgba(200,200,200,0.8)';
    }
  }, [value]);

  return <Container ref={ref} background={background} id={id} {...rest} />;
});
