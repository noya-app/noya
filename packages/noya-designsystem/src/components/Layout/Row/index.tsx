import React, { memo } from 'react';
import styled from 'styled-components';

const Row = styled.div((_p) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: '10px',
  paddingRight: '10px',
}));

export default memo(Row);
