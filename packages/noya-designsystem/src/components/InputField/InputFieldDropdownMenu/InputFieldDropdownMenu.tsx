import React, { memo } from 'react';
import styled from 'styled-components';

import { Button } from '../../Button';
import { Layout } from '../../Layout';
import NoyaDropDownMenu from '../../DropdownMenu';
import type { InputFieldDropdownProps } from '../types';

const DropdownContainer = styled.span(({ theme }) => ({
  position: 'absolute',
  right: 0,
}));

function InputFieldDropdownMenu<T extends string>({
  id,
  items,
  onSelect,
}: InputFieldDropdownProps<T>) {
  return (
    <DropdownContainer>
      <NoyaDropDownMenu<T> items={items} onSelect={onSelect}>
        <Button id={id} variant="thin">
          <Layout.Icon name="caret-down" />
        </Button>
      </NoyaDropDownMenu>
    </DropdownContainer>
  );
}

export default memo(InputFieldDropdownMenu);
