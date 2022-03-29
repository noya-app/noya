import React, { memo } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

const Container = styled(View)(({ theme }) => ({
  flexDirection: 'row',
  minHeight: 35,
  justifyContent: 'space-evenly',
  alignItems: 'flex-start',
}));

export default memo(Container);
