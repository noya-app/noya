import { round } from '@noya-app/noya-utils';
import { InputField } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
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
  trigger?: 'change' | 'submit';
}

export const DimensionInput = memo(function DimensionInput({
  id,
  value,
  onSetValue,
  label,
  size,
  placeholder = 'multi',
  disabled,
  trigger = 'submit',
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
        disabled={disabled}
        {...(trigger === 'change'
          ? { onChange: handleSetValue }
          : { onSubmit: handleSetValue })}
      />
      {label && <InputField.Label>{label}</InputField.Label>}
    </InputField.Root>
  );
});
