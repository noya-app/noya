import React, { memo } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

const DividerContainer = styled(View)(({ theme }) => ({
  height: 1,
  minHeight: 1,
  background: theme.colors.divider,
}));

export default memo(DividerContainer);
