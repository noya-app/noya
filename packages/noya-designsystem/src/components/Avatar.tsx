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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const Text = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  color: 'white',
}));

export const Avatar = memo(function Avatar(props: Props) {
  return (
    <Container>
      <Text>S</Text>
    </Container>
  );
});
