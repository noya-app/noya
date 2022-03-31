import React, { memo, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { View } from 'react-native';

import Sketch from 'noya-file-format';
import { useSketchImage } from 'noya-renderer';
import { Layout } from '../Layout';
import { sketchColorToRgbaString } from 'noya-colorpicker';

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

// const ColorPreviewBackground = memo(function ColorPreviewBackground)

export const FillPreviewBackground = memo(function FillPreviewBackground({
  value,
}) {
  if (!value) {
    return <HorizontalDotsBackground />;
  }

  switch (value._class) {
    case 'color':

    default:
      return null;
  }
});
