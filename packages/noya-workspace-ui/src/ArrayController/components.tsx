import styled from 'styled-components';

export const ElementRow = styled.div({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: '10px',
});

export const ItemContainer = styled.div<{ ref?: any }>({
  position: 'relative',
});
