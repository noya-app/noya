import styled from 'styled-components';

export const Row = styled.div(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: '10px',
  paddingRight: '10px',
}));

export const LabelContainer = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  width: '69px',
  display: 'flex',
  alignItems: 'center',
}));
