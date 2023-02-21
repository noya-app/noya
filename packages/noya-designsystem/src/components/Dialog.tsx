import * as DialogPrimitive from '@radix-ui/react-dialog';
import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useRef,
} from 'react';
import styled from 'styled-components';
import { IconButton } from './IconButton';
import { Spacer } from './Spacer';

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
  borderRadius: 2,
  ...theme.textStyles.small,
  backgroundColor: theme.colors.popover.background,
  overflowY: 'auto',
  color: theme.colors.textMuted,
  '&:focus': { outline: 'none' },
  pointerEvents: 'all',
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
  zIndex: 1,
  backgroundColor: theme.colors.popover.background,
  padding: '4px 6px',
  borderRadius: '2px',
  boxShadow: '0 0 2px rgba(0, 0, 0, 0.2)',
  border: `1px solid ${theme.colors.divider}`,
}));

export interface IDialog {
  containsElement: (element: HTMLElement) => boolean;
}

interface Props {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  style?: ComponentProps<typeof StyledContent>['style'];
  open: ComponentProps<typeof DialogPrimitive.Root>['open'];
  onOpenChange?: ComponentProps<typeof DialogPrimitive.Root>['onOpenChange'];
  onOpenAutoFocus?: ComponentProps<
    typeof DialogPrimitive.Content
  >['onOpenAutoFocus'];
}

export const Dialog = forwardRef(function Dialog(
  {
    children,
    title,
    description,
    open,
    style,
    onOpenChange,
    onOpenAutoFocus,
  }: Props,
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
      <StyledContent
        ref={contentRef}
        onOpenAutoFocus={onOpenAutoFocus}
        style={style}
      >
        <CloseButtonContainer>
          <DialogPrimitive.Close asChild>
            <IconButton iconName="Cross1Icon" />
          </DialogPrimitive.Close>
        </CloseButtonContainer>
        {title && (
          <>
            <StyledTitle>{title}</StyledTitle>
            <Spacer.Vertical size={description ? 10 : 20} />
          </>
        )}
        {description && (
          <>
            <Spacer.Vertical size={10} />
            <StyledDescription>{description}</StyledDescription>
            <Spacer.Vertical size={20} />
          </>
        )}
        {children}
      </StyledContent>
    </DialogPrimitive.Root>
  );
});
