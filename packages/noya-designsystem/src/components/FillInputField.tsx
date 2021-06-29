import Sketch from '@sketch-hq/sketch-file-format-ts';
import { ForwardedRef, forwardRef, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { sketchColorToRgbaString } from '../utils/sketchColor';
import { getGradientBackground } from '../utils/getGradientBackground';
import { getPatternBackground, SketchPattern } from '../utils/sketchPattern';
import { useApplicationState } from '../../../app/src/contexts/ApplicationStateContext';
import { useObjectURL } from '../../../app/src/hooks/useObjectURL';

const Container = styled.button<{
  background: string;
}>(({ theme, background }) => ({
  outline: 'none',
  width: '40px',
  height: '27px',
  borderRadius: '4px',
  border: 'none',
  boxShadow: `0 0 0 1px ${theme.colors.divider} inset`,
  background,
  '&:focus': {
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
  },
}));

const dotsHorizontalSvg = (fillColor: string) => `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15' fill='${fillColor}'>
    <path d='M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z'></path>
  </svg>
`;

interface Props {
  id?: string;
  value?: Sketch.Color | Sketch.Gradient | SketchPattern;
}

export default forwardRef(function FillInputField(
  { id, value, ...rest }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const [state] = useApplicationState();
  const { inputBackground, placeholderDots } = useTheme().colors;

  const backgroundPattern = useObjectURL(
    getPatternBackground(
      state.sketch.images,
      value && value._class === 'pattern' ? value.image : undefined,
    ),
  );

  const background = useMemo(() => {
    if (!value)
      return [
        `center url("data:image/svg+xml;utf8,${dotsHorizontalSvg(
          placeholderDots,
        )}") no-repeat`,
        inputBackground,
      ].join(',');

    switch (value._class) {
      case 'color':
        return sketchColorToRgbaString(value);
      case 'gradient':
        return getGradientBackground(value.stops, value.gradientType, 180);
      case 'pattern': {
        return `center / cover url(${backgroundPattern})`;
      }
    }
  }, [value, placeholderDots, inputBackground, backgroundPattern]);

  return <Container ref={ref} background={background} id={id} {...rest} />;
});
