import React, { Children, isValidElement, memo, useMemo } from 'react';
import styled from 'styled-components';

import { InputFieldRootProps } from '../types';
import { InputFieldContext } from '../context';
import InputFieldLabel from '../InputFieldLabel';

function InputFieldRoot({
  id,
  flex,
  children,
  size,
  labelPosition = 'end',
  labelSize = 6,
}: InputFieldRootProps) {
  const childrenArray = Children.toArray(children);

  const hasDropdown = false;
  // childrenArray.some(
  //   (child) => isValidElement(child) && child.type === DropdownMenu,
  // );
  const hasLabel = childrenArray.some(
    (child) => isValidElement(child) && child.type === InputFieldLabel,
  );

  const contextValue = useMemo(
    () => ({ labelPosition, labelSize, hasDropdown, hasLabel }),
    [labelPosition, labelSize, hasDropdown, hasLabel],
  );

  return (
    <InputFieldContext.Provider value={contextValue}>
      <RootContainer id={id} size={size} flex={flex}>
        {children}
      </RootContainer>
    </InputFieldContext.Provider>
  );
}

export default memo(InputFieldRoot);

const RootContainer = styled.div<{ size?: number; flex?: string }>(
  ({ theme, flex, size }) => ({
    flex: flex ?? '1',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    maxWidth: typeof size === 'number' ? `${size}px` : undefined,
  }),
);
