import {
  Alpha,
  ColorModel,
  ColorPicker as NoyaColorPicker,
  equalColorObjects,
  HsvaColor,
  hsvaToRgba,
  Hue,
  rgbaToHsva,
  Saturation,
} from 'noya-colorpicker';
import type Sketch from 'noya-file-format';
import React, { memo, useCallback, useMemo } from 'react';
import * as Spacer from '../components/Spacer';
import { rgbaToSketchColor, sketchColorToRgba } from '../utils/sketchColor';

interface Props {
  value: Sketch.Color;
  onChange: (color: Sketch.Color) => void;
}

const colorModel: ColorModel<HsvaColor> = {
  defaultColor: { h: 0, s: 0, v: 0, a: 1 },
  equal: equalColorObjects,
  toHsva: (a) => a,
  fromHsva: (a) => a,
};

export default memo(function ColorPicker({ value, onChange }: Props) {
  const hsva = value.colorSpaces?.hsva;

  const color = useMemo(() => {
    return hsva
      ? { h: hsva.hue, s: hsva.saturation, v: hsva.value, a: hsva.alpha }
      : rgbaToHsva(sketchColorToRgba(value));
  }, [value, hsva]);

  const handleChange = useCallback(
    (hsva: HsvaColor) => {
      const updated = rgbaToSketchColor(hsvaToRgba(hsva));

      updated.colorSpaces = {
        hsva: {
          hue: hsva.h,
          saturation: hsva.s,
          value: hsva.v,
          alpha: hsva.a,
        },
      };

      onChange(updated);
    },
    [onChange],
  );

  return (
    <NoyaColorPicker<HsvaColor>
      color={color}
      colorModel={colorModel}
      onChange={handleChange}
    >
      <Saturation />
      <Spacer.Vertical size={12} />
      <Hue />
      <Spacer.Vertical size={5} />
      <Alpha />
    </NoyaColorPicker>
  );
});
