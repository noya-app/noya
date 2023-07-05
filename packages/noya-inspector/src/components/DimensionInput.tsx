import { InputField } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { round } from 'noya-utils';
import React, { memo, useCallback } from 'react';

export type DimensionValue = number | undefined;

interface Props {
  id?: string;
  value: DimensionValue;
  onSetValue: (value: number, mode: SetNumberMode) => void;
  label?: string;
  size?: number;
  placeholder?: string;
  disabled?: boolean;
}

export const DimensionInput = memo(function DimensionInput({
  id,
  value,
  onSetValue,
  label,
  size,
  placeholder = 'multi',
  disabled,
}: Props) {
  const handleNudgeValue = useCallback(
    (value: number) => onSetValue(value, 'adjust'),
    [onSetValue],
  );

  const handleSetValue = useCallback(
    (value) => onSetValue(value, 'replace'),
    [onSetValue],
  );

  return (
    <InputField.Root id={id} width={size}>
      <InputField.NumberInput
        value={value === undefined ? value : round(value, 2)}
        placeholder={value === undefined ? placeholder : undefined}
        onNudge={handleNudgeValue}
        onSubmit={handleSetValue}
        disabled={disabled}
      />
      {label && <InputField.Label>{label}</InputField.Label>}
    </InputField.Root>
  );
});
