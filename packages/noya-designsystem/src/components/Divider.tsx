import React, { memo } from 'react';
import styled from 'styled-components';

/* ----------------------------------------------------------------------------
 * Divider
 * ------------------------------------------------------------------------- */

type DividerVariant = 'normal' | 'strong' | 'subtle';

const DividerContainer = styled.div<{
  variant: DividerVariant;
  orientation: 'horizontal' | 'vertical';
}>(({ theme, variant, orientation }) => ({
  ...(orientation === 'horizontal'
    ? { height: '1px', minHeight: '1px' }
    : { width: '1px', minWidth: '1px' }),
  background:
    variant === 'strong'
      ? theme.colors.dividerStrong
      : variant === 'subtle'
      ? theme.colors.dividerSubtle
      : theme.colors.divider,
}));

interface DividerProps {
  variant?: DividerVariant;
}

export const Divider = memo(function Divider({
  variant = 'normal',
}: DividerProps) {
  return <DividerContainer variant={variant} orientation="horizontal" />;
});

export const DividerVertical = memo(function DividerVertical({
  variant = 'normal',
}: DividerProps) {
  return <DividerContainer variant={variant} orientation="vertical" />;
});
