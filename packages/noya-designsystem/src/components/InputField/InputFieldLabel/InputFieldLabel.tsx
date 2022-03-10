import React, { useContext } from 'react';
import styled from 'styled-components';

import type { InputFieldLabelProps, LabelPosition } from '../types';
import { InputFieldContext } from '../context';

const LabelContainer = styled.label<{
  labelPosition: LabelPosition;
  hasDropdown: boolean;
}>(({ theme, labelPosition, hasDropdown }) => ({
  color: theme.colors.textMuted,
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none',
  fontWeight: 'bold',
  fontSize: '60%',
  opacity: 0.5,
  userSelect: 'none',
  ...(labelPosition === 'start'
    ? { justifyContent: 'flex-start', paddingLeft: '6px' }
    : {
        justifyContent: 'flex-end',
        paddingRight: hasDropdown ? '16px' : '6px',
      }),
}));

export default function InputFieldLabel({
  children = undefined,
}: InputFieldLabelProps) {
  const { labelPosition, hasDropdown } = useContext(InputFieldContext);

  return (
    <LabelContainer labelPosition={labelPosition} hasDropdown={hasDropdown}>
      {children}
    </LabelContainer>
  );
}
