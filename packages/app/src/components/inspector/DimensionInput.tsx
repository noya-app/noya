import { InputField } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { memo, useCallback } from 'react';
import { DimensionValue } from './DimensionsInspector';

interface Props {
  id?: string;
  value: DimensionValue;
  onSetValue: (value: number, mode: SetNumberMode) => void;
  label?: string;
  size?: number;
  placeholder?: string;
}

export default memo(function DimensionInput({
  id,
  value,
  onSetValue,
  label,
  size,
  placeholder = 'multi',
}: Props) {
  const handleNudgeValue = useCallback(
    (value: number) => onSetValue(value, 'adjust'),
    [onSetValue],
  );

  const handleSetValue = useCallback((value) => onSetValue(value, 'replace'), [
    onSetValue,
  ]);

  return (
    <InputField.Root id={id} size={size}>
      <InputField.NumberInput
        value={value}
        placeholder={value === undefined ? placeholder : undefined}
        onNudge={handleNudgeValue}
        onSubmit={handleSetValue}
      />
      {label && <InputField.Label>{label}</InputField.Label>}
    </InputField.Root>
  );
});
