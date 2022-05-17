import React, { memo } from 'react';
import { View } from 'react-native';
import styled from 'styled-components';

import { ButtonElement, ButtonContent } from '../../Button/Button.native';
import { Layout } from '../../Layout';
import NoyaDropDownMenu from '../../DropdownMenu';
import type { InputFieldDropdownProps } from '../types';

const DropdownContainer = styled(View)({
  position: 'absolute',
  right: 0,
});

function InputFieldDropdownMenu<T extends string>({
  id,
  items,
  onSelect,
}: InputFieldDropdownProps<T>) {
  return (
    <DropdownContainer>
      <NoyaDropDownMenu<T> items={items} onSelect={onSelect}>
        <ButtonElement variant="thin">
          <ButtonContent>
            <Layout.Icon name="caret-down" />
          </ButtonContent>
        </ButtonElement>
      </NoyaDropDownMenu>
    </DropdownContainer>
  );
}

export default memo(InputFieldDropdownMenu);
