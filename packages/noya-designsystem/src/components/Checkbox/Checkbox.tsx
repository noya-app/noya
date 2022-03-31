import React, { ChangeEventHandler, memo, useCallback } from 'react';

import type { CheckboxProps } from './types';

export const Checkbox = memo(function Checkbox({
  onChange,
  ...props
}: CheckboxProps) {
  const onChangeCallback: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      onChange?.(event.target.checked);
    },
    [onChange],
  );

  return (
    <input
      {...props}
      type="checkbox"
      onChange={onChange ? onChangeCallback : undefined}
    />
  );
});
