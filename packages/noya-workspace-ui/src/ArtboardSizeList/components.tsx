import styled from 'styled-components';

export const Header = styled.div(({ theme }) => ({
  display: 'flex',
  padding: '8px',
}));

export const SizeLabel = styled.span(({ theme }) => ({
  ...theme.textStyles.code,
}));
