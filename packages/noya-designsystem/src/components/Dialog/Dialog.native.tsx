import React, { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { Modal, View, Text } from 'react-native';
import styled, { useTheme } from 'styled-components';

import { IconButton } from '../Button/IconButton';
import { Layout } from '../Layout';
import type { DialogProps, IDialog } from './types';

const Overlay = styled(View)({
  backgroundColor: 'rgba(0,0,0,0.5)',
  flex: 1,
  paddingTop: '10%',
  alignItems: 'center',
});

const Content = styled(View)(({ theme }) => ({
  padding: theme.sizes.dialog.padding,
  borderRadius: 4,
  backgroundColor: theme.colors.popover.background,
  width: '90%',
  maxWidth: 450,
  maxHeight: '85%',
}));

const ContentHeader = styled(View)({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const Title = styled(Text)(({ theme }) => ({
  ...theme.textStyles.body,
  color: theme.colors.text,
}));

const Description = styled(Text)(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.textMuted,
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
  const theme = useTheme();
  const contentRef = useRef<View>(null);

  const onCloseClick = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Modal visible={open} transparent>
      <Overlay>
        <Content ref={contentRef}>
          <ContentHeader>
            {title && <Title>{title}</Title>}
            <IconButton
              name="cross-1"
              onClick={onCloseClick}
              color={theme.colors.textMuted}
            />
          </ContentHeader>
          <Layout.Stack size={20} />
          {description && (
            <>
              <Description>{description}</Description>
              <Layout.Stack size={20} />
            </>
          )}
          {children}
        </Content>
      </Overlay>
    </Modal>
  );
});
