import * as PopoverPrimitive from '@radix-ui/react-popover';
import React from 'react';
import styled from 'styled-components';

type PopoverVariant = 'normal' | 'large';

const ContentElement = styled(PopoverPrimitive.Content)<{
  variant?: PopoverVariant;
}>(({ theme, variant }) => ({
  borderRadius: 4,
  fontSize: 14,
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  maxHeight: '600px',
  overflowY: 'auto',
  color: theme.colors.textMuted,
  ...(variant === 'large' && { width: '680px' }),
  ...(variant === 'normal' && { width: '240px' }),
}));

const ArrowElement = styled(PopoverPrimitive.Arrow)(({ theme }) => ({
  fill: theme.colors.popover.background,
}));

interface Props {
  children: React.ReactNode;
  trigger: React.ReactNode;
  variant?: PopoverVariant;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ children, trigger, variant, onOpenChange }: Props) {
  return (
    <PopoverPrimitive.Root onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <ContentElement
          variant={variant}
          side="bottom"
          align="center"
          sideOffset={4}
        >
          {children}
          <ArrowElement />
        </ContentElement>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
