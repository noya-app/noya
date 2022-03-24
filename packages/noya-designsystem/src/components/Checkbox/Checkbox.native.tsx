import React, { memo } from 'react';
import RNCheckBox from '@react-native-community/checkbox';

import type { CheckboxProps } from './types';

export const Checkbox = memo(function Checkbox(props: CheckboxProps) {
  const { checked, onChange, ...otherProps } = props;

  return (
    <RNCheckBox value={checked} onValueChange={onChange} {...otherProps} />
  );
});
