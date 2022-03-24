import React, { memo } from 'react';
import styled from 'styled-components';

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  minHeight: '35px',
  alignItems: 'center',
  justifyContent: 'space-evenly',
}));

export default memo(Container);
