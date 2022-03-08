import React, { memo, useCallback } from 'react';

import type { KeyDownParams } from '../../internal/TextInput/types';
import type { InputFieldNumberInputProps } from '../types';
import { parseNumber, handleNudge } from './utils';
import InputFieldInput from '../InputFieldInput';

function InputFieldNumberInput(props: InputFieldNumberInputProps) {
  const { value, placeholder, onNudge } = props;
  const onSubmit = 'onSubmit' in props ? props.onSubmit : undefined;
  const onChange = 'onChange' in props ? props.onChange : undefined;

  const handleSubmit = useCallback(
    (value: string) => {
      const newValue = parseNumber(value);

      if (!isNaN(newValue)) {
        onSubmit?.(newValue);
      }
    },
    [onSubmit],
  );

  const handleKeyDown = useCallback(
    (event: KeyDownParams) => {
      const amount = handleNudge(event);

      if (!amount) return;

      onNudge?.(amount);
    },
    [onNudge],
  );

  const handleChange = useCallback(
    (value: string) => {
      onChange?.(parseNumber(value));
    },
    [onChange],
  );

  return (
    <InputFieldInput
      {...props}
      value={value === undefined ? '' : String(value)}
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
      keyboardType="decimal-pad"
      {...('onChange' in props
        ? { onChange: handleChange }
        : { onSubmit: handleSubmit })}
    />
  );
}

export default memo(InputFieldNumberInput);
