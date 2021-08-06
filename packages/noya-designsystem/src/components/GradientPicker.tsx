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
  Gradient,
} from 'noya-colorpicker';
import { memo, useCallback, useMemo } from 'react';
import * as Spacer from '../components/Spacer';
import { rgbaToSketchColor, sketchColorToRgba } from '../utils/sketchColor';

interface Props {
  value: Sketch.GradientStop[];
  selectedStop: number;
  onChangeColor: (color: Sketch.Color) => void;
  onChangePosition: (position: number) => void;
  onAdd: (color: Sketch.Color, position: number) => void;
  onDelete: () => void;
  onSelectStop: (index: number) => void;
}

export default memo(function GradientPicker({
  value,
  selectedStop,
  onChangeColor,
  onChangePosition,
  onAdd,
  onDelete,
  onSelectStop,
}: Props) {
  const colorModel: ColorModel<RgbaColor> = useMemo(
    () => ({
      defaultColor: { r: 0, g: 0, b: 0, a: 1 },
      toHsva: rgbaToHsva,
      fromHsva: hsvaToRgba,
      equal: equalColorObjects,
    }),
    [],
  );

  const rgbaColor = useMemo(
    () => sketchColorToRgba(value[selectedStop].color),
    [value, selectedStop],
  );

  const handleChangeColor = useCallback(
    (value: RgbaColor) => {
      onChangeColor(rgbaToSketchColor(value));
    },
    [onChangeColor],
  );

  const handleAddGradientStop = useCallback(
    (value: RgbaColor, position: number) => {
      onAdd(rgbaToSketchColor(value), position);
    },
    [onAdd],
  );

  return (
    <NoyaColorPicker
      onChange={handleChangeColor}
      colorModel={colorModel}
      color={rgbaColor}
    >
      <Gradient
        gradients={value}
        selectedStop={selectedStop}
        onSelectStop={onSelectStop}
        onChangePosition={onChangePosition}
        onAdd={handleAddGradientStop}
        onDelete={onDelete}
      />
      <Spacer.Vertical size={10} />
      <Saturation />
      <Spacer.Vertical size={12} />
      <Hue />
      <Spacer.Vertical size={5} />
      <Alpha />
    </NoyaColorPicker>
  );
});
