import { Cross1Icon, PlusIcon } from '@noya-app/noya-icons';
import React, { memo } from 'react';
import styled from 'styled-components';
import { useDesignSystemTheme } from '../contexts/DesignSystemConfiguration';
import { useHover } from '../hooks/useHover';

type ChipColorScheme = 'primary' | 'secondary' | 'error';
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
      : colorScheme === 'error'
      ? 'rgb(255, 219, 219)'
      : theme.colors.inputBackground;

  const subtleColor =
    colorScheme === 'primary'
      ? 'rgba(238, 229, 255, 0.2)'
      : colorScheme === 'secondary'
      ? 'rgba(205, 238, 231, 0.2)'
      : colorScheme === 'error'
      ? 'rgba(255, 219, 219, 0.2)'
      : 'rgba(0, 0, 0, 0.1)';

  return {
    textTransform: 'initial',
    borderRadius: 4,
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    lineHeight: '1.4',
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
          color,
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
        // top: '-1px',
        transform: 'scale(0.75)',
      }
    : {
        transform: 'scale(0.6)',
      }),

  '&:hover': {
    opacity: 0.85,
  },
}));

const ignoredProps = new Set(['size', 'isOnlyChild']);

const AddElement = styled(PlusIcon).withConfig({
  shouldForwardProp: (prop) => !ignoredProps.has(prop),
})<{
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
  tabIndex?: number;
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
  tabIndex,
  onDelete,
  onClick,
  onAdd,
  onHoverDeleteChange,
}: ChipProps) {
  const theme = useDesignSystemTheme();

  const { hoverProps: hoverDeleteProps } = useHover({
    onHoverChange: onHoverDeleteChange,
  });

  const handleClick = !children && !deletable && addable ? onAdd : onClick;

  const color =
    colorScheme === 'primary'
      ? theme.colors.primary
      : colorScheme === 'secondary'
      ? theme.colors.secondary
      : theme.colors.text;

  return (
    <ChipElement
      variant={variant}
      colorScheme={colorScheme}
      style={style}
      onClick={handleClick}
      size={size}
      monospace={monospace}
      isInteractive={!!handleClick}
      tabIndex={tabIndex}
    >
      {children}
      {deletable && (
        <DeleteElement
          size={size}
          {...(hoverDeleteProps as any)}
          onClick={onDelete}
          color={color}
        />
      )}
      {addable && (
        <AddElement
          size={size}
          isOnlyChild={!children && !deletable}
          onClick={onAdd}
          color={color}
        />
      )}
    </ChipElement>
  );
});
