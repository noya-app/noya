import { Cross1Icon } from 'noya-icons';
import React, { memo } from 'react';
import styled from 'styled-components';

type ChipVariant = 'primary' | 'secondary';

const ChipElement = styled.span<{ variant?: ChipVariant }>(
  ({ theme, variant }) => ({
    ...theme.textStyles.label,
    lineHeight: 'inherit',
    padding: '4px',
    borderRadius: 4,
    userSelect: 'none',
    display: 'inline-flex',
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
  }),
);

const DeleteElement = styled(Cross1Icon)({
  marginLeft: 2,
  marginRight: '-2px',
  transform: 'scale(0.75)',
  cursor: 'pointer',
  opacity: 0.5,
});

export interface ChipProps {
  variant?: ChipVariant;
  children?: React.ReactNode;
  deletable?: boolean;
  onDelete?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Chip = memo(function Chip({
  variant,
  children,
  deletable,
  style,
  onDelete,
  onClick,
}: ChipProps) {
  return (
    <ChipElement variant={variant} style={style} onClick={onClick}>
      {children}
      {deletable && <DeleteElement onClick={onDelete} />}
    </ChipElement>
  );
});
