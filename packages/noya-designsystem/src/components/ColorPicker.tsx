import React, { memo, useCallback, useMemo } from 'react';

import type Sketch from 'noya-file-format';
import {
  Alpha,
  ColorModel,
  ColorPicker as NoyaColorPicker,
  equalColorObjects,
  hsvaToRgba,
  Hue,
  RgbaColor,
  rgbaToHsva,
  Saturation,
  rgbaToSketchColor,
  sketchColorToRgba,
} from 'noya-colorpicker';
import { Layout } from './Layout';

interface Props {
  value: Sketch.Color;
  onChange: (color: Sketch.Color) => void;
}

export default memo(function ColorPicker({ value, onChange }: Props) {
  const colorModel: ColorModel<RgbaColor> = {
    defaultColor: { r: 0, g: 0, b: 0, a: 1 },
    toHsva: rgbaToHsva,
    fromHsva: hsvaToRgba,
    equal: equalColorObjects,
  };
  const rgbaColor: RgbaColor = useMemo(() => sketchColorToRgba(value), [value]);

  const handleChange = useCallback(
    (value: RgbaColor) => {
      onChange(rgbaToSketchColor(value));
    },
    [onChange],
  );

  return (
    <NoyaColorPicker
      colorModel={colorModel}
      onChange={handleChange}
      color={rgbaColor}
    >
      <Saturation />
      <Layout.Stack size={12} />
      <Hue />
      <Layout.Stack size={8} />
      <Alpha />
    </NoyaColorPicker>
  );
});
