import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  ColorModel,
  GradientPicker as NoyaGradientPicker,
  equalColorObjects,
  hsvaToRgba,
  RgbaColor,
  rgbaToHsva,
  Saturation,
} from 'noya-colorpicker';
import Gradient from 'noya-colorpicker/src/components/Gradient';
import { memo, useCallback } from 'react';
import * as Spacer from '../components/Spacer';
import { rgbaToSketchColor } from '../utils/sketchColor';

const colorModel: ColorModel<RgbaColor> = {
  defaultColor: { r: 0, g: 0, b: 0, a: 1 },
  toHsva: rgbaToHsva,
  fromHsva: hsvaToRgba,
  equal: equalColorObjects,
};

interface Props {
  value: Sketch.GradientStop[];
  onChangeColor: (color: Sketch.Color, index: number) => void;
  onChangePosition: (index: number, position: number) => void;
  onAdd: (color: Sketch.Color, position: number) => void;
}

export default memo(function GradientPicker({
  value,
  onChangeColor,
  onChangePosition,
  onAdd,
}: Props) {
  const handleChangeColor = useCallback(
    (value: RgbaColor, index: number) => {
      onChangeColor(rgbaToSketchColor(value), index ?? 0);
    },
    [onChangeColor],
  );

  const handleChangePosition = useCallback(
    (value: number, index: number) => {
      onChangePosition(value, index);
    },
    [onChangePosition],
  );

  const handleAddGradientStop = useCallback(
    (value: RgbaColor, position: number) => {
      onAdd(rgbaToSketchColor(value), position);
    },
    [onAdd],
  );

  return (
    <NoyaGradientPicker
      colorModel={colorModel}
      color={colorModel.defaultColor}
      onChangeColor={handleChangeColor}
      onChangePosition={handleChangePosition}
      onAdd={handleAddGradientStop}
    >
      <Gradient gradients={value} />
      <Spacer.Vertical size={12} />
      <Saturation isGradient={true} />
      <Spacer.Vertical size={12} />
    </NoyaGradientPicker>
  );
});
