import type Sketch from '@sketch-hq/sketch-file-format-ts';
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
} from 'noya-colorpicker';
import { memo, useCallback, useMemo } from 'react';
import * as Spacer from '../components/Spacer';
import { rgbaToSketchColor, sketchColorToRgba } from '../utils/sketchColor';

const colorModel: ColorModel<RgbaColor> = {
  defaultColor: { r: 0, g: 0, b: 0, a: 1 },
  toHsva: rgbaToHsva,
  fromHsva: hsvaToRgba,
  equal: equalColorObjects,
};

interface Props {
  value: Sketch.Color;
  gradients?: Sketch.GradientStop[];
  onChange: (color: Sketch.Color) => void;
}

export default memo(function ColorPicker({
  value,
  gradients,
  onChange,
}: Props) {
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
      color={rgbaColor}
      onChange={handleChange}
    >
      <Spacer.Vertical size={12} />
      <Saturation />
      <Spacer.Vertical size={12} />
      <Hue />
      <Spacer.Vertical size={5} />
      <Alpha />
    </NoyaColorPicker>
  );
});
