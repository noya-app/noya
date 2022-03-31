import React, { memo, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { View } from 'react-native';

import { sketchColorToRgbaString } from 'noya-colorpicker';
// import { useSketchImage } from 'noya-renderer';
import { Layout } from '../Layout';
import { ColorProps, GradientProps, PatternProps, PreviewProps } from './types';

const Background = styled(View)<{ background?: string }>(
  ({ theme, background }) => ({
    backgroundColor: background ?? theme.colors.inputBackground,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }),
);

const HorizontalDotsBackground = memo(function HorizontalDotsBackground() {
  const { placeholderDots } = useTheme().colors;

  return (
    <Background>
      <Layout.Icon name="dots-horizontal" size={28} color={placeholderDots} />
    </Background>
  );
});

const ColorPreviewBackground = memo(function ColorPreviewBackground({
  color,
}: ColorProps) {
  const background = useMemo(() => sketchColorToRgbaString(color), [color]);

  return <Background background={background} />;
});

const GradientPreviewBackground = memo(function GradientPreviewBackground({
  gradient,
}: GradientProps) {
  return null;
});

const PatternPreviewBackground = memo(function PatternPreviewBackground({
  fillType,
  tileScale,
  imageRef,
}: PatternProps) {
  return null;
});

export const FillPreviewBackground = memo(function FillPreviewBackground({
  value,
}: PreviewProps) {
  if (!value) {
    return <HorizontalDotsBackground />;
  }

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
