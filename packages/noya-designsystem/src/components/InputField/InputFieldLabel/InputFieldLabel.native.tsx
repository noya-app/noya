import React, { useContext, memo } from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

import type { InputFieldLabelProps, LabelPosition } from '../types';
import { InputFieldContext } from '../context';

const LabelContainer = styled(View)<{
  labelPosition: LabelPosition;
  hasDropdown: boolean;
}>(({ theme, labelPosition, hasDropdown }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  flexDirection: 'row',
  alignItems: 'center',
  opacity: 0.5,
  ...(labelPosition === 'start'
    ? { justifyContent: 'flex-start', paddingLeft: 6 }
    : {
        justifyContent: 'flex-end',
        paddingRight: hasDropdown ? 16 : 6,
      }),
}));

const LabelText = styled(Text)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.colors.textMuted,
  fontSize: theme.textStyles.label.fontSize,
}));

function InputFieldLabel({ children = undefined }: InputFieldLabelProps) {
  const { labelPosition, hasDropdown } = useContext(InputFieldContext);

  return (
    <LabelContainer
      labelPosition={labelPosition}
      hasDropdown={hasDropdown}
      pointerEvents="box-none"
    >
      <LabelText>{children}</LabelText>
    </LabelContainer>
  );
}

export default memo(InputFieldLabel);
