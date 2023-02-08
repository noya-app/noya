import * as ProgressPrimitive from '@radix-ui/react-progress';
import { clamp } from 'noya-utils';
import React, { CSSProperties } from 'react';
import styled from 'styled-components';

type ProgressVariant = 'normal' | 'warning' | 'primary' | 'secondary';

export function Progress({
  value,
  width,
  height = 5,
  flex,
  variant = 'normal',
}: {
  value: number;
  height?: CSSProperties['height'];
  width?: CSSProperties['width'];
  flex?: CSSProperties['flex'];
  variant?: ProgressVariant;
}) {
  const clampedValue = clamp(value, 0, 100);

  return (
    <ProgressRoot value={clampedValue} style={{ width, flex, height }}>
      <ProgressIndicator
        variant={variant}
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </ProgressRoot>
  );
}

const ProgressRoot = styled(ProgressPrimitive.Root)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: theme.colors.inputBackground,

  // Fix overflow clipping in Safari
  // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
  transform: 'translateZ(0)',
}));

const ProgressIndicator = styled(ProgressPrimitive.Indicator)<{
  variant: ProgressVariant;
}>(({ theme, variant }) => ({
  backgroundColor:
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
      ? theme.colors.secondary
      : variant === 'warning'
      ? theme.colors.warning
      : 'white',
  width: '100%',
  height: '100%',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
}));
