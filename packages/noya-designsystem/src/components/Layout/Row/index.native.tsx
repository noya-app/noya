import React, { memo } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

const Row = styled(View)((_p) => ({
  flexDirection: 'row',
  paddingLeft: 10,
  paddingRight: 10,
}));

export default memo(Row);
