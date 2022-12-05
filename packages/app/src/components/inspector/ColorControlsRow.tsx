import { SetNumberMode } from 'noya-state';
import React, { memo } from 'react';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import { DimensionValue } from './DimensionsInspector';
import { DimensionSliderRow } from './DimensionSliderRow';

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
    <InspectorPrimitives.Column id={id}>
      <DimensionSliderRow
        id={id}
        label="Hue"
        value={hue}
        min={-100}
        max={100}
        inputFieldLabel="%"
        onChange={onChangeHue}
      />
      <DimensionSliderRow
        id={id}
        label="Saturation"
        value={saturation}
        min={-100}
        max={100}
        inputFieldLabel="%"
        onChange={onChangeSaturation}
      />
      <DimensionSliderRow
        id={id}
        label="Brightness"
        value={brightness}
        min={-100}
        max={100}
        inputFieldLabel="%"
        onChange={onChangeBrightness}
      />
      <DimensionSliderRow
        id={id}
        label="Contrast"
        value={contrast}
        min={-100}
        max={100}
        inputFieldLabel="%"
        onChange={onChangeContrast}
      />
    </InspectorPrimitives.Column>
  );
});
