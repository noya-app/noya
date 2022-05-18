import React, { memo } from 'react';
import { View } from 'react-native';
import styled from 'styled-components';

import { Layout } from '../../Layout';
import NoyaDropDownMenu from '../../DropdownMenu';
import type { InputFieldDropdownProps } from '../types';

const DropdownContainer = styled(View)({
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  zIndex: 1,
});

const DropDownView = styled(View)({
  minHeight: 19,
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

function InputFieldDropdownMenu<T extends string>({
  items,
  onSelect,
}: InputFieldDropdownProps<T>) {
  return (
    <DropdownContainer>
      <NoyaDropDownMenu<T> items={items} onSelect={onSelect}>
        <DropDownView>
          <Layout.Icon name="caret-down" />
        </DropDownView>
      </NoyaDropDownMenu>
    </DropdownContainer>
  );
}

export default memo(InputFieldDropdownMenu);
