import { Point, Size } from 'noya-geometry';
import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useRef,
} from 'react';
import styled from 'styled-components';
import { Stacking } from './stacking';

export const PositioningElement = styled.div({
  top: '-9999px',
  left: '-9999px',
  position: 'absolute',
  zIndex: Stacking.level.menu,
});

export const ContentElement = styled.div<{
  size: Size;
}>(({ theme, size }) => ({
  ...theme.textStyles.small,
  borderRadius: 4,
  overflow: 'hidden',
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  color: theme.colors.textMuted,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  ...size,
}));

export interface IModalMenu {
  setPosition: (position: Point) => void;
}

interface Props {
  children: ReactNode;
  size: Size;
}

export const ModalMenu = forwardRef(function ModalMenu(
  { children, size }: Props,
  forwardedRef: ForwardedRef<IModalMenu>,
) {
  const ref = useRef<HTMLDivElement>(null);

  useImperativeHandle(forwardedRef, () => ({
    setPosition: (position) => {
      if (!ref.current) return;

      ref.current.style.top = `${position.y + window.pageYOffset + 24}px`;
      ref.current.style.left = `${position.x + window.pageXOffset}px`;
    },
  }));

  return (
    <PositioningElement ref={ref}>
      <ContentElement size={size}>{children}</ContentElement>
    </PositioningElement>
  );
});
