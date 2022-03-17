import { memo, useCallback } from 'react';

import { InputField, Slider } from 'noya-web-designsystem';
import { DimensionValue } from 'noya-workspace-ui';
import { SetNumberMode } from 'noya-state';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';

interface Props {
  id: string;
  label: string;
  value: DimensionValue;
  min: number;
  max: number;
  inputFieldLabel?: string;
  onChange: (value: number, mode: SetNumberMode) => void;
}

export const DimensionSliderRow = memo(function DimensionSliderRow({
  id,
  label,
  value,
  min,
  max,
  inputFieldLabel,
  onChange,
}: Props) {
  const handleSubmit = useCallback(
    (value: number) => onChange(value, 'replace'),
    [onChange],
  );

  const handleNudge = useCallback(
    (value: number) => onChange(value, 'adjust'),
    [onChange],
  );

  return (
    <InspectorPrimitives.LabeledSliderRow label={label}>
      <Slider
        id={`${id}-slider`}
        value={value ?? 0}
        onValueChange={handleSubmit}
        min={min}
        max={max}
      />
      <InspectorPrimitives.HorizontalSeparator />
      <InputField.Root id={`${id}-input`} size={50}>
        <InputField.NumberInput
          value={value}
          placeholder={value === undefined ? 'multi' : undefined}
          onSubmit={handleSubmit}
          onNudge={handleNudge}
        />
        {inputFieldLabel && (
          <InputField.Label>{inputFieldLabel}</InputField.Label>
        )}
      </InputField.Root>
    </InspectorPrimitives.LabeledSliderRow>
  );
});
