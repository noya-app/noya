import * as AvatarPrimitive from '@radix-ui/react-avatar';
import React from 'react';
import styled from 'styled-components';

const AvatarRoot = styled(AvatarPrimitive.Root)<{
  size: number;
  overflow: number;
}>(({ theme, size, overflow }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
  overflow: 'hidden',
  userSelect: 'none',
  width: size,
  height: size,
  borderRadius: '100%',
  backgroundColor: theme.colors.secondaryLight,
  ...(overflow && {
    margin: `-${overflow}px`,
  }),
}));

const AvatarImage = styled(AvatarPrimitive.Image)({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 'inherit',
});

const AvatarFallback = styled(AvatarPrimitive.Fallback)<{
  size: number;
}>(({ theme, size }) => ({
  fontSize: '0.8rem',
  fontWeight: 500,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  lineHeight: `${size}px`,
}));

export function Avatar({
  image,
  name,
  fallback,
  size = 19,
  overflow = 0,
}: {
  image?: string;
  name?: string;
  fallback?: string;
  size?: number;
  overflow?: number;
}) {
  return (
    <AvatarRoot size={size} overflow={overflow}>
      <AvatarImage src={image} alt={name} />
      <AvatarFallback size={size}>{fallback}</AvatarFallback>
    </AvatarRoot>
  );
}
