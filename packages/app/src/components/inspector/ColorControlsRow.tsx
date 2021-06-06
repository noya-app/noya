import { InputField, Slider, Spacer } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import { DimensionValue } from './DimensionsInspector';

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

export default memo(function FillRow({
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
  const huePercent =
    hue === undefined ? undefined : Math.round((hue / Math.PI) * 100);

  const handleSubmitHue = useCallback(
    (value: number) => {
      onChangeHue((Math.round(value) / 100) * Math.PI, 'replace');
    },
    [onChangeHue],
  );

  const handleNudgeHue = useCallback(
    (value: number) => {
      onChangeHue((Math.round(value) / 100) * Math.PI, 'adjust');
    },
    [onChangeHue],
  );

  return (
    <>
      <InspectorPrimitives.Row>
        <Slider
          id="hue-slider"
          value={huePercent ?? 0}
          onValueChange={handleSubmitHue}
          min={-100}
          max={100}
        />
        <Spacer.Horizontal size={10} />
        <InputField.Root id="hue-input" size={50}>
          <InputField.NumberInput
            value={huePercent}
            placeholder={hue === undefined ? 'multi' : undefined}
            onSubmit={handleSubmitHue}
            onNudge={handleNudgeHue}
          />
          <InputField.Label>%</InputField.Label>
        </InputField.Root>
      </InspectorPrimitives.Row>
    </>
  );
});
