import React, { memo } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

const Row = styled(View)<{ spacing?: number }>(({ spacing }) => ({
  flexDirection: 'row',
  paddingLeft: spacing ?? 10,
  paddingRight: spacing ?? 10,
}));

export default memo(Row);
