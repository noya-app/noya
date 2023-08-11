import { Cross1Icon, PlusIcon } from 'noya-icons';
import React, { memo } from 'react';
import styled from 'styled-components';
import { useHover } from '../hooks/useHover';

type ChipColorScheme = 'primary' | 'secondary';
type ChipSize = 'small' | 'medium';
type ChipVariant = 'solid' | 'outlined' | 'ghost';

const ChipElement = styled.span<{
  colorScheme?: ChipColorScheme;
  size: ChipSize;
  monospace: boolean;
  variant: ChipVariant;
  isInteractive: boolean;
}>(({ theme, colorScheme, size, variant, monospace, isInteractive }) => {
  const color =
    colorScheme === 'primary'
      ? theme.colors.primary
      : colorScheme === 'secondary'
      ? theme.colors.secondary
      : theme.colors.text;

  const backgroundColor =
    colorScheme === 'primary'
      ? 'rgb(238, 229, 255)'
      : colorScheme === 'secondary'
      ? 'rgb(205, 238, 231)'
      : theme.colors.inputBackground;

  const subtleColor =
    colorScheme === 'primary'
      ? 'rgba(238, 229, 255, 0.2)'
      : colorScheme === 'secondary'
      ? 'rgba(205, 238, 231, 0.2)'
      : 'rgba(0, 0, 0, 0.1)';

  return {
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
    ...(variant === 'solid'
      ? {
          color: theme.colors.text,
          backgroundColor,
        }
      : variant === 'outlined'
      ? {
          color,
          backgroundColor: 'transparent',
          boxShadow: `0 0 0 1px ${subtleColor} inset`,
        }
      : {}),
    '&:hover': {
      ...(variant === 'outlined' && {
        backgroundColor: subtleColor,
        boxShadow: 'none',
      }),
    },
    ...(isInteractive && {
      cursor: 'pointer',
    }),
  };
});

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
  isOnlyChild: boolean;
}>(({ size, isOnlyChild }) => ({
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
        ...(isOnlyChild && { marginLeft: '-2px' }),
      }),

  '&:hover': {
    opacity: 0.85,
  },
}));

export interface ChipProps {
  colorScheme?: ChipColorScheme;
  variant?: ChipVariant;
  size?: ChipSize;
  children?: React.ReactNode;
  deletable?: boolean;
  addable?: boolean;
  monospace?: boolean;
  onDelete?: () => void;
  onAdd?: () => void;
  onClick?: () => void;
  onHoverDeleteChange?: (hovering: boolean) => void;
  style?: React.CSSProperties;
}

export const Chip = memo(function Chip({
  colorScheme,
  children,
  deletable,
  addable,
  style,
  size = 'medium',
  variant = 'solid',
  monospace = false,
  onDelete,
  onClick,
  onAdd,
  onHoverDeleteChange,
}: ChipProps) {
  const { hoverProps: hoverDeleteProps } = useHover({
    onHoverChange: onHoverDeleteChange,
  });

  const handleClick = !children && !deletable && addable ? onAdd : onClick;

  return (
    <ChipElement
      variant={variant}
      colorScheme={colorScheme}
      style={style}
      onClick={handleClick}
      size={size}
      monospace={monospace}
      isInteractive={!!handleClick}
    >
      {children}
      {deletable && (
        <DeleteElement
          size={size}
          {...(hoverDeleteProps as any)}
          onClick={onDelete}
        />
      )}
      {addable && (
        <AddElement
          size={size}
          isOnlyChild={!children && !deletable}
          onClick={onAdd}
        />
      )}
    </ChipElement>
  );
});
