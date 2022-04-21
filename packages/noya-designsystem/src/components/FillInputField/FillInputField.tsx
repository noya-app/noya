import { ForwardedRef, forwardRef, memo } from 'react';
import styled from 'styled-components';

import { FillPreviewBackground } from './FillPreviewBackground';
import { FillInputFieldProps } from './types';

const Container = styled.button<{ flex?: string | number }>(
  ({ theme, flex }) => ({
    outline: 'none',
    padding: 0,
    width: '50px',
    height: '27px',
    borderRadius: '4px',
    overflow: 'hidden',
    border: 'none',
    boxShadow: `0 0 0 1px ${theme.colors.divider} inset`,
    background: 'transparent',
    '&:focus': {
      boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
    },
    position: 'relative',
    flex,
  }),
);

export default memo(
  forwardRef(function FillInputField(
    { id, value, ...rest }: FillInputFieldProps,
    ref: ForwardedRef<HTMLButtonElement>,
  ) {
    return (
      <Container ref={ref} id={id} {...rest}>
        <FillPreviewBackground value={value} />
      </Container>
    );
  }),
);
