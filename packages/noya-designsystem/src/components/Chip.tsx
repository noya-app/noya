import { Cross1Icon, PlusIcon } from 'noya-icons';
import React, { memo } from 'react';
import styled from 'styled-components';
import { useHover } from '../hooks/useHover';

type ChipVariant = 'primary' | 'secondary';
type ChipSize = 'small' | 'medium';

const ChipElement = styled.span<{
  variant?: ChipVariant;
  size: ChipSize;
  monospace: boolean;
}>(({ theme, variant, size, monospace }) => ({
  textTransform: 'initial',
  borderRadius: 4,
  userSelect: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  ...(size === 'medium'
    ? {
        fontSize: '11px',
        padding: '4px 8px',
      }
    : {
        fontSize: '9px',
        padding: '0px 4px',
      }),
  ...(monospace && {
    fontFamily: theme.fonts.monospace,
  }),
  ...(variant === 'primary' && {
    color: theme.colors.primary,
    background: 'rgb(238, 229, 255)',
  }),
  ...(variant === 'secondary' && {
    color: theme.colors.secondary,
    background: 'rgb(205, 238, 231)',
  }),
  ...(variant === undefined && {
    color: theme.colors.text,
    background: theme.colors.inputBackground,
  }),
}));

const DeleteElement = styled(Cross1Icon)<{
  size: ChipSize;
}>(({ size }) => ({
  position: 'relative',
  marginRight: '-2px',
  cursor: 'pointer',
  opacity: 0.5,

  ...(size === 'medium'
    ? {
        marginLeft: '2px',
        top: '-1px',
        transform: 'scale(0.75)',
      }
    : {
        transform: 'scale(0.6)',
      }),

  '&:hover': {
    opacity: 0.85,
  },
}));

const AddElement = styled(PlusIcon)<{
  size: ChipSize;
}>(({ size }) => ({
  position: 'relative',
  marginRight: '-2px',
  cursor: 'pointer',
  opacity: 0.5,

  ...(size === 'medium'
    ? {
        marginLeft: '2px',
        top: '-1px',
        transform: 'scale(0.75)',
      }
    : {
        transform: 'scale(0.6)',
      }),

  '&:hover': {
    opacity: 0.85,
  },
}));

export interface ChipProps {
  variant?: ChipVariant;
  size?: ChipSize;
  children?: React.ReactNode;
  deletable?: boolean;
  addable?: boolean;
  monospace?: boolean;
  onDelete?: () => void;
  onClick?: () => void;
  onHoverDeleteChange?: (hovering: boolean) => void;
  style?: React.CSSProperties;
}

export const Chip = memo(function Chip({
  variant,
  children,
  deletable,
  addable,
  style,
  size = 'medium',
  monospace = false,
  onDelete,
  onClick,
  onHoverDeleteChange,
}: ChipProps) {
  const { hoverProps: hoverDeleteProps } = useHover({
    onHoverChange: onHoverDeleteChange,
  });

  return (
    <ChipElement
      variant={variant}
      style={style}
      onClick={onClick}
      size={size}
      monospace={monospace}
    >
      {children}
      {deletable && (
        <DeleteElement
          size={size}
          {...(hoverDeleteProps as any)}
          onClick={onDelete}
        />
      )}
      {addable && <AddElement size={size} />}
    </ChipElement>
  );
});
