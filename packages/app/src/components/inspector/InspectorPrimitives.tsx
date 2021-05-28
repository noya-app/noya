import styled from 'styled-components';

export const Section = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
}));

export const SectionHeader = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

export const Title = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'row',
  userSelect: 'none',
}));

export const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

export const Checkbox = styled.input(({ theme }) => ({
  margin: 0,
}));

export const Text = styled.span(({ theme }) => ({
  ...theme.textStyles.small,
}));
