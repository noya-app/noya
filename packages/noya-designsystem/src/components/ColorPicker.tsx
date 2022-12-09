import {
  Alpha,
  ColorModel,
  ColorPicker as NoyaColorPicker,
  HsvaColor,
  hsvaToRgba,
  Hue,
  rgbaToHsva,
  Saturation,
} from 'noya-colorpicker';
import type Sketch from 'noya-file-format';
import React, { memo } from 'react';
import * as Spacer from '../components/Spacer';
import { rgbaToSketchColor, sketchColorToRgba } from '../utils/sketchColor';

interface Props {
  value: Sketch.Color;
  onChange: (color: Sketch.Color) => void;
}

const colorModel: ColorModel<HsvaColor> = {
  defaultColor: { h: 0, s: 0, v: 0, a: 1 },
  equal: (a, b) => a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a,
  toHsva: (a) => a,
  fromHsva: (a) => a,
};

export default memo(function ColorPicker({ value, onChange }: Props) {
  const input = value.colorSpaces?.hsva;

  const color = input
    ? { h: input.hue, s: input.saturation, v: input.value, a: input.alpha }
    : rgbaToHsva(sketchColorToRgba(value));

  return (
    <NoyaColorPicker<HsvaColor>
      color={color}
      colorModel={colorModel}
      onChange={(hsva) => {
        const updatedSketchRgba = rgbaToSketchColor(hsvaToRgba(hsva));

        const updated: Sketch.Color = {
          ...value,
          ...updatedSketchRgba,
          colorSpaces: {
            hsva: {
              hue: hsva.h,
              saturation: hsva.s,
              value: hsva.v,
              alpha: hsva.a,
            },
          },
        };

        onChange(updated);
      }}
    >
      <Saturation />
      <Spacer.Vertical size={12} />
      <Hue />
      <Spacer.Vertical size={5} />
      <Alpha />
    </NoyaColorPicker>
  );
});
