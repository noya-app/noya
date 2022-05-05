import React, { memo, useCallback, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { View, Image, ImageResizeMode, LayoutChangeEvent } from 'react-native';
import {
  vec,
  Rect,
  Canvas,
  SweepGradient,
  LinearGradient,
  RadialGradient,
} from '@shopify/react-native-skia';

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

const GradientBackground = styled(Canvas)(({ theme }) => ({
  backgroundColor: theme.colors.inputBackground,
  width: '100%',
  height: '100%',
}));

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
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setSize({
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height,
      });
    },
    [setSize],
  );

  const positions = useMemo(
    () => gradient.stops.map((stop) => stop.position),
    [gradient.stops],
  );

  const colors = useMemo(
    () => gradient.stops.map((stop) => sketchColorToRgbaString(stop.color)),
    [gradient.stops],
  );

  const gradientPaint = useMemo(() => {
    switch (gradient.gradientType) {
      case Sketch.GradientType.Linear: {
        return (
          <LinearGradient
            start={vec(size.width / 2, 0)}
            end={vec(size.width / 2, size.height)}
            positions={positions}
            colors={colors}
          />
        );
      }
      case Sketch.GradientType.Radial: {
        return (
          <RadialGradient
            c={vec(size.width / 2, size.height / 2)}
            r={Math.max(size.width, size.height) / 2}
            colors={colors}
            positions={positions}
          />
        );
      }
      case Sketch.GradientType.Angular: {
        return (
          <SweepGradient
            c={vec(size.width / 2, size.height / 2)}
            colors={colors}
            positions={positions}
          />
        );
      }
    }
  }, [gradient, size, positions, colors]);

  return (
    <Background onLayout={onLayout}>
      <GradientBackground>
        <Rect x={0} y={0} width={size.width} height={size.height}>
          {gradientPaint}
        </Rect>
      </GradientBackground>
    </Background>
  );
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
