import styled from 'styled-components';
import { mediaQuery } from '../theme';

export const InputField = styled.input({
  fontSize: 16,
  minWidth: '24rem',
  height: '4rem',
  padding: '0 1rem',
  outline: 0,
  border: 'none',
  borderTopLeftRadius: '1rem',
  borderBottomLeftRadius: '1rem',
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  ':focus': {
    boxShadow: 'inset 0px 0px 0px 2px #be6dff',
  },
  [mediaQuery.medium]: {
    fontSize: '1.5rem',
  },
});
