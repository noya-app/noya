import { InputField, Slider } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import { DimensionValue } from './DimensionsInspector';

interface ColorControlInputProps {
  id: string;
  label: string;
  value: DimensionValue;
  onChange: (value: number, mode: SetNumberMode) => void;
}

function ColorControlInput({
  id,
  label,
  value,
  onChange,
}: ColorControlInputProps) {
  const handleSubmit = useCallback(
    (value: number) => onChange(value, 'replace'),
    [onChange],
  );

  const handleNudge = useCallback(
    (value: number) => onChange(value, 'adjust'),
    [onChange],
  );

  return (
    <InspectorPrimitives.LabeledRow label={label}>
      <Slider
        id={`${id}-slider`}
        value={value ?? 0}
        onValueChange={handleSubmit}
        min={-100}
        max={100}
      />
      <InspectorPrimitives.HorizontalSeparator />
      <InputField.Root id={`${id}-input`} size={50}>
        <InputField.NumberInput
          value={value}
          placeholder={value === undefined ? 'multi' : undefined}
          onSubmit={handleSubmit}
          onNudge={handleNudge}
        />
        <InputField.Label>%</InputField.Label>
      </InputField.Root>
    </InspectorPrimitives.LabeledRow>
  );
}

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
  return (
    <InspectorPrimitives.Column id={id}>
      <ColorControlInput
        id={id}
        label="Hue"
        value={hue}
        onChange={onChangeHue}
      />
      <ColorControlInput
        id={id}
        label="Saturation"
        value={saturation}
        onChange={onChangeSaturation}
      />
      <ColorControlInput
        id={id}
        label="Brightness"
        value={brightness}
        onChange={onChangeBrightness}
      />
      <ColorControlInput
        id={id}
        label="Contrast"
        value={contrast}
        onChange={onChangeContrast}
      />
    </InspectorPrimitives.Column>
  );
});
