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
import Gradient from 'noya-colorpicker/src/components/Gradient';
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
  onChange:
    | ((color: Sketch.Color) => void)
    | ((color: Sketch.Color, index: number, position: number) => void);
}

export default memo(function ColorPicker({
  value,
  gradients,
  onChange,
}: Props) {
  const rgbaColor: RgbaColor = useMemo(() => sketchColorToRgba(value), [value]);

  const handleChange = useCallback(
    (value: RgbaColor, index?: number, position?: number) => {
      onChange(rgbaToSketchColor(value), index ?? 0, position ?? 0.5);
    },
    [onChange],
  );

  return (
    <NoyaColorPicker
      colorModel={colorModel}
      color={rgbaColor}
      onChange={handleChange}
    >
      {gradients && <Gradient gradients={gradients} />}
      <Spacer.Vertical size={12} />
      <Saturation />
      <Spacer.Vertical size={12} />
      <Hue />
      <Spacer.Vertical size={5} />
      <Alpha />
    </NoyaColorPicker>
  );
});
