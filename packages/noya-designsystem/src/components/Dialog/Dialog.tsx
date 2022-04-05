import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styled from 'styled-components';

import { IconButton } from '../Button/IconButton';
import { Layout } from '../Layout';
import type { DialogProps, IDialog } from './types';

const StyledOverlay = styled(DialogPrimitive.Overlay)({
  backgroundColor: 'rgba(0,0,0,0.5)',
  position: 'fixed',
  inset: 0,
});

const StyledContent = styled(DialogPrimitive.Content)(({ theme }) => ({
  boxShadow:
    'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '450px',
  maxHeight: '85vh',
  padding: theme.sizes.dialog.padding,
  borderRadius: 4,
  ...theme.textStyles.small,
  backgroundColor: theme.colors.popover.background,
  overflowY: 'auto',
  color: theme.colors.textMuted,
  '&:focus': { outline: 'none' },
}));

const StyledTitle = styled(DialogPrimitive.Title)(({ theme }) => ({
  margin: 0,
  ...theme.textStyles.body,
  color: theme.colors.text,
}));

const StyledDescription = styled(DialogPrimitive.Description)(({ theme }) => ({
  margin: 0,
  ...theme.textStyles.small,
  color: theme.colors.textMuted,
}));

const CloseButtonContainer = styled.div(({ theme }) => ({
  position: 'absolute',
  top: theme.sizes.dialog.padding,
  right: theme.sizes.dialog.padding,
}));

export const Dialog = forwardRef(function Dialog(
  {
    children,
    title,
    description,
    open,
    onOpenChange,
    onOpenAutoFocus,
  }: DialogProps,
  forwardedRef: ForwardedRef<IDialog>,
) {
  const contentRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(forwardedRef, () => ({
    containsElement(element) {
      if (!contentRef.current) return false;

      return contentRef.current.contains(element);
    },
  }));

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <StyledOverlay />
      <StyledContent ref={contentRef} onOpenAutoFocus={onOpenAutoFocus}>
        <CloseButtonContainer>
          <DialogPrimitive.Close as={IconButton} name="cross-1" />
        </CloseButtonContainer>
        {title && (
          <>
            <StyledTitle>{title}</StyledTitle>
            <Layout.Stack size={description ? 10 : 20} />
          </>
        )}
        {description && (
          <>
            <Layout.Stack size={10} />
            <StyledDescription>{description}</StyledDescription>
            <Layout.Stack size={20} />
          </>
        )}
        {children}
      </StyledContent>
    </DialogPrimitive.Root>
  );
});