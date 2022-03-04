import React, { Children, isValidElement, useMemo } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

import { InputFieldRootProps } from '../types';
import { InputFieldContext } from '../context';

export default function InputFieldRoot({
  flex,
  children,
  size,
  labelPosition = 'end',
  labelSize = 6,
}: InputFieldRootProps) {
  // const childrenArray = Children.toArray(children);

  const hasDropdown = false;
  // childrenArray.some(
  //   (child) => isValidElement(child) && child.type === DropdownMenu,
  // );
  const hasLabel = false;
  // childrenArray.some(
  //   (child) => isValidElement(child) && child.type === Label,
  // );

  const contextValue = useMemo(
    () => ({ labelPosition, labelSize, hasDropdown, hasLabel }),
    [labelPosition, labelSize, hasDropdown, hasLabel],
  );

  return (
    <InputFieldContext.Provider value={contextValue}>
      <RootContainer size={size} flex={flex}>
        {children}
      </RootContainer>
    </InputFieldContext.Provider>
  );
}

const RootContainer = styled(View)<{ size?: number; flex?: string }>(
  ({ flex, size }) => ({
    flex: flex ?? 1,
    flexDirection: 'row',
    position: 'relative',
    maxWidth: size ?? undefined,
  }),
);
