import { memo, useCallback } from 'react';

import type { KeyDownParams } from '../../internal/TextInput/types';
import type { InputFieldNumberInputProps } from '../types';
import InputFieldInput from '../InputFieldInput';

function parseNumber(value: string) {
  return value ? Number(value) : NaN;
}

function handleNudge(e: {
  key: string;
  shiftKey: boolean;
  altKey: boolean;
}): number | undefined {
  let handled = false;
  let amount = 0;

  switch (e.key) {
    case 'ArrowUp':
      amount = 1;
      handled = true;
      break;
    case 'ArrowDown':
      amount = -1;
      handled = true;
      break;
  }

  if (!handled) return;

  if (e.shiftKey) {
    amount *= 10;
  } else if (e.altKey) {
    amount *= 0.1;
  }

  return handled ? amount : undefined;
}

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

      // event.preventDefault();
      // event.stopPropagation();
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
      {...('onChange' in props
        ? { onChange: handleChange }
        : { onSubmit: handleSubmit })}
    />
  );
}

export default memo(InputFieldNumberInput);
