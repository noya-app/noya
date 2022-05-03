import React, { memo } from 'react';

import { Button } from '../../Button';
import { Layout } from '../../Layout';
import NoyaDropDownMenu from '../../DropdownMenu';
import type { InputFieldDropdownProps } from '../types';
import DropdownContainer from './container';

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
