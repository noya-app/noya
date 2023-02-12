import * as PopoverPrimitive from '@radix-ui/react-popover';
import React, { ComponentProps } from 'react';
import styled from 'styled-components';
import { IconButton } from './IconButton';

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

const PopoverClose = styled(PopoverPrimitive.Close)(({ theme }) => ({
  all: 'unset',
  fontFamily: 'inherit',
  borderRadius: '100%',
  height: 25,
  width: 25,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: 5,
  right: 5,
}));

interface Props
  extends Pick<
    ComponentProps<typeof PopoverPrimitive['Content']>,
    | 'onPointerDownOutside'
    | 'onCloseAutoFocus'
    | 'onInteractOutside'
    | 'onFocusOutside'
  > {
  children: React.ReactNode;
  trigger: React.ReactNode;
  variant?: PopoverVariant;
  closable?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sideOffset?: number;
}

export function Popover({
  children,
  trigger,
  variant,
  closable,
  open,
  sideOffset = 4,
  onOpenChange,
  onInteractOutside,
  onCloseAutoFocus,
  onFocusOutside,
  onPointerDownOutside,
}: Props) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <ContentElement
          variant={variant}
          side="bottom"
          align="center"
          sideOffset={sideOffset}
          onCloseAutoFocus={onCloseAutoFocus}
          onInteractOutside={onInteractOutside}
          onFocusOutside={onFocusOutside}
          onPointerDownOutside={onPointerDownOutside}
          collisionPadding={8}
        >
          {children}
          <ArrowElement />
          {closable && (
            <PopoverClose>
              <IconButton iconName="Cross2Icon" />
            </PopoverClose>
          )}
        </ContentElement>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
