import React, { memo } from 'react';
import styled from 'styled-components';
import RNCheckBox from '@react-native-community/checkbox';

import type { CheckboxProps } from './types';

const StyledCheckbox = styled(RNCheckBox)({
  width: 16,
  height: 16,
});

export const Checkbox = memo(function Checkbox(props: CheckboxProps) {
  const { checked, onChange, ...otherProps } = props;

  return (
    <StyledCheckbox
      lineWidth={1}
      boxType="square"
      value={checked}
      onValueChange={onChange}
      {...otherProps}
    />
  );
});
