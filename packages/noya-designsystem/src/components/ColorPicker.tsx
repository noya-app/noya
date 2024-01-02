import type { Sketch } from '@noya-app/noya-file-format';
import {
  Alpha,
  ColorModel,
  HsvaColor,
  Hue,
  ColorPicker as NoyaColorPicker,
  Saturation,
  equalColorObjects,
  hsvaToRgba,
  rgbaToHsva,
} from 'noya-colorpicker';
import React, { memo, useCallback, useMemo } from 'react';
import { rgbaToSketchColor, sketchColorToRgba } from '../utils/sketchColor';
import { Spacer } from './Spacer';

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

export const ColorPicker = memo(function ColorPicker({
  value,
  onChange,
}: Props) {
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
