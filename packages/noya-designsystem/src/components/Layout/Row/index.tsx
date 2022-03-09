import React, { memo } from 'react';
import styled from 'styled-components';

const Row = styled.div<{ spacing?: number }>(({ spacing }) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: `${spacing ?? 10}px`,
  paddingRight: `${spacing ?? 10}px`,
}));

export default memo(Row);
