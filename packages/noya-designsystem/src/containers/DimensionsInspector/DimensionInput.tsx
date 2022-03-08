import React, { memo, useCallback } from 'react';

import { round } from 'noya-utils';
import { InputField } from '../../components/InputField';
import type { DimensionInputProps } from './types';

export default memo(function DimensionInput({
  id,
  value,
  onSetValue,
  label,
  size,
  placeholder = 'multi',
  disabled,
}: DimensionInputProps) {
  const handleNudgeValue = useCallback(
    (value: number) => onSetValue(value, 'adjust'),
    [onSetValue],
  );

  const handleSetValue = useCallback(
    (value) => onSetValue(value, 'replace'),
    [onSetValue],
  );

  return (
    <InputField.Root id={id} size={size}>
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
