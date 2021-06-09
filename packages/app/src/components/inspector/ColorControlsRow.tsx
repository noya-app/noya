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
  const handleSubmitHue = useCallback(
    (value: number) => onChangeHue(value, 'replace'),
    [onChangeHue],
  );

  const handleNudgeHue = useCallback(
    (value: number) => onChangeHue(value, 'adjust'),
    [onChangeHue],
  );

  const handleSubmitSaturation = useCallback(
    (value: number) => onChangeSaturation(value, 'replace'),
    [onChangeSaturation],
  );

  const handleNudgeSaturation = useCallback(
    (value: number) => onChangeSaturation(value, 'adjust'),
    [onChangeSaturation],
  );

  const handleSubmitBrightness = useCallback(
    (value: number) => onChangeBrightness(value, 'replace'),
    [onChangeBrightness],
  );

  const handleNudgeBrightness = useCallback(
    (value: number) => onChangeBrightness(value, 'adjust'),
    [onChangeBrightness],
  );

  const handleSubmitContrast = useCallback(
    (value: number) => onChangeContrast(value, 'replace'),
    [onChangeContrast],
  );

  const handleNudgeContrast = useCallback(
    (value: number) => onChangeContrast(value, 'adjust'),
    [onChangeContrast],
  );

  return (
    <InspectorPrimitives.Column id={id}>
      <InspectorPrimitives.LabeledRow label="Hue">
        <Slider
          id="hue-slider"
          value={hue ?? 0}
          onValueChange={handleSubmitHue}
          min={-100}
          max={100}
        />
        <Spacer.Horizontal size={10} />
        <InputField.Root id="hue-input" size={50}>
          <InputField.NumberInput
            value={hue}
            placeholder={hue === undefined ? 'multi' : undefined}
            onSubmit={handleSubmitHue}
            onNudge={handleNudgeHue}
          />
          <InputField.Label>%</InputField.Label>
        </InputField.Root>
      </InspectorPrimitives.LabeledRow>
      <InspectorPrimitives.LabeledRow label="Saturation">
        <Slider
          id="saturation-slider"
          value={saturation ?? 0}
          onValueChange={handleSubmitSaturation}
          min={-100}
          max={100}
        />
        <Spacer.Horizontal size={10} />
        <InputField.Root id="saturation-input" size={50}>
          <InputField.NumberInput
            value={saturation}
            placeholder={saturation === undefined ? 'multi' : undefined}
            onSubmit={handleSubmitSaturation}
            onNudge={handleNudgeSaturation}
          />
          <InputField.Label>%</InputField.Label>
        </InputField.Root>
      </InspectorPrimitives.LabeledRow>
      <InspectorPrimitives.LabeledRow label="Brightness">
        <Slider
          id="brightness-slider"
          value={brightness ?? 0}
          onValueChange={handleSubmitBrightness}
          min={-100}
          max={100}
        />
        <Spacer.Horizontal size={10} />
        <InputField.Root id="brightness-input" size={50}>
          <InputField.NumberInput
            value={brightness}
            placeholder={brightness === undefined ? 'multi' : undefined}
            onSubmit={handleSubmitBrightness}
            onNudge={handleNudgeBrightness}
          />
          <InputField.Label>%</InputField.Label>
        </InputField.Root>
      </InspectorPrimitives.LabeledRow>
      <InspectorPrimitives.LabeledRow label="Contrast">
        <Slider
          id="contrast-slider"
          value={contrast ?? 0}
          onValueChange={handleSubmitContrast}
          min={-100}
          max={100}
        />
        <Spacer.Horizontal size={10} />
        <InputField.Root id="contrast-input" size={50}>
          <InputField.NumberInput
            value={contrast}
            placeholder={contrast === undefined ? 'multi' : undefined}
            onSubmit={handleSubmitContrast}
            onNudge={handleNudgeContrast}
          />
          <InputField.Label>%</InputField.Label>
        </InputField.Root>
      </InspectorPrimitives.LabeledRow>
    </InspectorPrimitives.Column>
  );
});
