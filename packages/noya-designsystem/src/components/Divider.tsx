import React, { memo } from 'react';
import styled from 'styled-components';

/* ----------------------------------------------------------------------------
 * Divider
 * ------------------------------------------------------------------------- */

type DividerVariant = 'normal' | 'strong' | 'subtle';

const DividerContainer = styled.div<
  DividerProps & {
    orientation: 'horizontal' | 'vertical';
  }
>(({ theme, variant = 'normal', orientation, overflow = 0 }) => ({
  ...(orientation === 'horizontal'
    ? { height: '1px', minHeight: '1px', margin: `0px -${overflow}px` }
    : { width: '1px', minWidth: '1px', margin: `-${overflow}px 0px` }),
  background:
    variant === 'strong'
      ? theme.colors.dividerStrong
      : variant === 'subtle'
      ? theme.colors.dividerSubtle
      : theme.colors.divider,
  alignSelf: 'stretch',
}));

interface DividerProps {
  variant?: DividerVariant;
  overflow?: number;
}

export const Divider = memo(function Divider(props: DividerProps) {
  return <DividerContainer orientation="horizontal" {...props} />;
});

export const DividerVertical = memo(function DividerVertical(
  props: DividerProps,
) {
  return <DividerContainer orientation="vertical" {...props} />;
});
