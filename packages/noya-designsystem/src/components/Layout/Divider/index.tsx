import React, { memo } from 'react';
import styled from 'styled-components';

const DividerContainer = styled.div(({ theme }) => ({
  height: '1px',
  minHeight: '1px',
  background: theme.colors.divider,
}));

export default memo(DividerContainer);
