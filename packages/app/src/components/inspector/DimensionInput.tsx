import { InputField } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { memo, useCallback } from 'react';
import { DimensionValue } from './DimensionsInspector';

export default memo(function DimensionInput({
  value,
  onSetValue,
  label,
}: {
  value: DimensionValue;
  onSetValue: (value: number, mode: SetNumberMode) => void;
  label: string;
}) {
  const handleNudgeValue = useCallback(
    (value: number) => onSetValue(value, 'adjust'),
    [onSetValue],
  );

  const handleSetValue = useCallback((value) => onSetValue(value, 'replace'), [
    onSetValue,
  ]);

  return (
    <InputField.Root>
      <InputField.NumberInput
        value={value}
        placeholder={value === undefined ? 'multi' : undefined}
        onNudge={handleNudgeValue}
        onSubmit={handleSetValue}
      />
      <InputField.Label>{label}</InputField.Label>
    </InputField.Root>
  );
});
