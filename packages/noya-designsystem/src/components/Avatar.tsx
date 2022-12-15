import React, { memo } from 'react';
import styled from 'styled-components';

interface Props {}

const Container = styled.div(({ theme }) => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  background: '#08f',
  border: '2px solid white',
  boxShadow: '0 1px 2px black',
}));

export const Avatar = memo(function Avatar(props: Props) {
  return <Container />;
});
