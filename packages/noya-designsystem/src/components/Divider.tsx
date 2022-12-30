import React, { memo } from 'react';
import styled from 'styled-components';

/* ----------------------------------------------------------------------------
 * Divider
 * ------------------------------------------------------------------------- */

const DividerContainer = styled.div(({ theme }) => ({
  height: '1px',
  minHeight: '1px',
  background: theme.colors.divider,
}));

interface DividerProps {}

export const Divider = memo(function Divider(props: DividerProps) {
  return <DividerContainer />;
});
