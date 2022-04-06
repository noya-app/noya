import React, { memo, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { View, Image, ImageResizeMode } from 'react-native';

import Sketch from 'noya-file-format';
import { sketchColorToRgbaString } from 'noya-colorpicker';
import { useSketchImage } from 'noya-renderer';
import { Base64 } from 'noya-utils';
import { Layout } from '../Layout';
import { ColorProps, GradientProps, PatternProps, PreviewProps } from './types';

function getPatternSizeAndPosition(
  fillType: Sketch.PatternFillType,
): ImageResizeMode {
  switch (fillType) {
    case Sketch.PatternFillType.Fit:
      return 'contain';
    case Sketch.PatternFillType.Tile:
      return 'repeat';
    case Sketch.PatternFillType.Fill:
      return 'cover';
    case Sketch.PatternFillType.Stretch:
      return 'stretch';
  }
}

const Background = styled(View)<{ background?: string }>(
  ({ theme, background }) => ({
    backgroundColor: background ?? theme.colors.inputBackground,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }),
);

const PreviewImage = styled(Image)({
  width: '100%',
  height: '100%',
});

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

export const PatternPreviewBackground = memo(function PatternPreviewBackground({
  fillType,
  tileScale,
  imageRef,
}: PatternProps) {
  const image = useSketchImage(imageRef);
  const resizeMode = getPatternSizeAndPosition(fillType);

  const imageString = useMemo(() => {
    if (!image) {
      return;
    }

    return Base64.encode(image);
  }, [image]);

  if (!imageString) {
    return null;
  }

  // TODO: rewrite to skia canvas to be able to scale the tile patterns?
  return (
    <PreviewImage
      source={{
        uri: `data:image/jpeg;base64,${imageString}`,
        // scale: fillType === Sketch.PatternFillType.Tile ? tileScale : 1,
      }}
      // resizeMethod={
      //   fillType === Sketch.PatternFillType.Tile ? 'scale' : 'resize'
      // }
      resizeMode={resizeMode}
    />
  );
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
