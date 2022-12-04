import Sketch from 'noya-file-format';
import { useSketchImage } from 'noya-renderer';
import React, { memo, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { useObjectURL } from '../hooks/useObjectURL';
import { getGradientBackground } from '../utils/getGradientBackground';
import { sketchColorToRgbaString } from '../utils/sketchColor';
import { SketchPattern } from '../utils/sketchPattern';

const dotsHorizontalSvg = (fillColor: string) => `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15' fill='${fillColor}'>
    <path d='M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z'></path>
  </svg>
`;

const Background = styled.span<{ background: string }>(({ background }) => ({
  background,
  position: 'absolute',
  inset: 0,
}));

const HorizontalDotsBackground = memo(function HorizontalDotsBackground() {
  const { inputBackground, placeholderDots } = useTheme().colors;

  const background = useMemo(
    () =>
      [
        `center url("data:image/svg+xml;utf8,${dotsHorizontalSvg(
          placeholderDots,
        )}") no-repeat`,
        inputBackground,
      ].join(','),
    [inputBackground, placeholderDots],
  );

  return <Background background={background} />;
});

function getPatternSizeAndPosition(
  fillType: Sketch.PatternFillType,
  tileScale: number,
) {
  switch (fillType) {
    case Sketch.PatternFillType.Fit:
      return 'center / contain';
    case Sketch.PatternFillType.Tile:
      return `top left / ${tileScale * 100}%`;
    case Sketch.PatternFillType.Fill:
      return 'center / cover';
    case Sketch.PatternFillType.Stretch:
      return 'center / 100% 100%';
  }
}

export const PatternPreviewBackground = memo(function PatternPreviewBackground({
  fillType,
  tileScale,
  imageRef,
}: {
  fillType: Sketch.PatternFillType;
  tileScale: number;
  imageRef: Sketch.FileRef | Sketch.DataRef;
}) {
  const image = useSketchImage(imageRef);

  const url = useObjectURL(image);

  const size = getPatternSizeAndPosition(fillType, tileScale);

  const background = useMemo(
    () =>
      [
        size,
        `url(${url})`,
        fillType === Sketch.PatternFillType.Tile ? 'repeat' : 'no-repeat',
      ].join(' '),
    [fillType, size, url],
  );

  return <Background background={background} />;
});

const ColorPreviewBackground = memo(function ColorPreviewBackground({
  color,
}: {
  color: Sketch.Color;
}) {
  const background = useMemo(() => sketchColorToRgbaString(color), [color]);

  return <Background background={background} />;
});

const GradientPreviewBackground = memo(function GradientPreviewBackground({
  gradient,
}: {
  gradient: Sketch.Gradient;
}) {
  const background = useMemo(
    () => getGradientBackground(gradient.stops, gradient.gradientType, 180),
    [gradient.gradientType, gradient.stops],
  );

  return <Background background={background} />;
});

interface Props {
  value?: Sketch.Color | Sketch.Gradient | SketchPattern;
}

export const FillPreviewBackground = memo(function FillPreviewBackground({
  value,
}: Props) {
  if (!value) return <HorizontalDotsBackground />;

  switch (value._class) {
    case 'color':
      return <ColorPreviewBackground color={value} />;
    case 'gradient':
      return <GradientPreviewBackground gradient={value} />;
    case 'pattern':
      if (!value.image) return null;

      return (
        <PatternPreviewBackground
          fillType={value.patternFillType}
          tileScale={value.patternTileScale}
          imageRef={value.image}
        />
      );
  }
});
