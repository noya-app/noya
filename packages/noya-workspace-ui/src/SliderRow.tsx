import React, { memo, useCallback } from 'react';

import { InputField, Slider } from 'noya-designsystem';
import { DimensionValue } from './DimensionsInspector';
import { SetNumberMode } from 'noya-state';
import { Primitives } from './primitives';

interface Props {
  id: string;
  label: string;
  value: DimensionValue;
  min: number;
  max: number;
  inputFieldLabel?: string;
  onChange: (value: number, mode: SetNumberMode) => void;
}

const SliderRow = memo(function SliderRow({
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
    <Primitives.LabeledSliderRow label={label}>
      <Slider
        id={`${id}-slider`}
        value={value ?? 0}
        onValueChange={handleSubmit}
        min={min}
        max={max}
      />
      <Primitives.HorizontalSeparator />
      <InputField.Root id={`${id}-input`} size={60}>
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
    </Primitives.LabeledSliderRow>
  );
});

export default memo(SliderRow);
