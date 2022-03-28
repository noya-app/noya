import React, { memo } from 'react';

import { SetNumberMode } from 'noya-state';
import { DimensionValue } from '../DimensionsInspector';
import { Primitives } from '../primitives';
import SliderRow from '../SliderRow';

interface Props {
  id: string;
  hue: DimensionValue;
  saturation: DimensionValue;
  brightness: DimensionValue;
  contrast: DimensionValue;
  onChangeHue: (value: number, mode: SetNumberMode) => void;
  onChangeSaturation: (value: number, mode: SetNumberMode) => void;
  onChangeBrightness: (value: number, mode: SetNumberMode) => void;
  onChangeContrast: (value: number, mode: SetNumberMode) => void;
}

export default memo(function ColorControlsRow({
  id,
  hue,
  saturation,
  brightness,
  contrast,
  onChangeHue,
  onChangeSaturation,
  onChangeBrightness,
  onChangeContrast,
}: Props) {
  return (
    <Primitives.Column id={id}>
      <SliderRow
        id={id}
        label="Hue"
        value={hue}
        min={-100}
        max={100}
        inputFieldLabel="%"
        onChange={onChangeHue}
      />
      <SliderRow
        id={id}
        label="Saturation"
        value={saturation}
        min={-100}
        max={100}
        inputFieldLabel="%"
        onChange={onChangeSaturation}
      />
      <SliderRow
        id={id}
        label="Brightness"
        value={brightness}
        min={-100}
        max={100}
        inputFieldLabel="%"
        onChange={onChangeBrightness}
      />
      <SliderRow
        id={id}
        label="Contrast"
        value={contrast}
        min={-100}
        max={100}
        inputFieldLabel="%"
        onChange={onChangeContrast}
      />
    </Primitives.Column>
  );
});
