import * as ToastPrimitive from '@radix-ui/react-toast';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { IconButton } from './IconButton';

const ToastViewport = styled(ToastPrimitive.Viewport)({
  position: 'fixed',
  bottom: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  padding: 20,
  gap: 10,
  minWidth: 200,
  maxWidth: '100vw',
  margin: 0,
  listStyle: 'none',
  zIndex: 2147483647,
  outline: 'none',
});

const ToastRoot = styled(ToastPrimitive.Root)(({ theme }) => ({
  borderRadius: 4,
  fontSize: 14,
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  color: theme.colors.textMuted,

  padding: '8px 10px',
  display: 'grid',
  gridTemplateAreas: '"title action" "description action"',
  gridTemplateColumns: 'auto max-content',
  columnGap: 10,
  alignItems: 'center',
}));

const ToastTitle = styled(ToastPrimitive.Title)(({ theme }) => ({
  gridArea: 'title',
  marginBottom: 5,
  ...theme.textStyles.label,
  fontWeight: 'bold',
  color: theme.colors.text,
}));

const ToastDescription = styled(ToastPrimitive.Description)(({ theme }) => ({
  gridArea: 'description',
  ...theme.textStyles.small,
  color: theme.colors.textMuted,
}));

const ToastAction = styled(ToastPrimitive.Action)({
  gridArea: 'action',
});

export const Toast = ({
  title,
  content,
  children,
  ...props
}: {
  title?: string;
  content: ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <ToastRoot {...props}>
      {title && <ToastTitle>{title}</ToastTitle>}
      <ToastDescription>{content}</ToastDescription>
      {children && (
        <ToastAction asChild altText="">
          {children}
        </ToastAction>
      )}
      <ToastPrimitive.Close aria-label="Close" asChild>
        <IconButton iconName="Cross1Icon" />
      </ToastPrimitive.Close>
    </ToastRoot>
  );
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => (
  <ToastPrimitive.Provider>
    {children}
    <ToastViewport />
  </ToastPrimitive.Provider>
);
