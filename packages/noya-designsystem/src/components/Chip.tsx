import styled from 'styled-components';

export const Chip = styled.span<{ variant: 'primary' | 'secondary' }>(
  ({ theme, variant }) => ({
    ...theme.textStyles.label,
    lineHeight: 'inherit',
    padding: '4px',
    borderRadius: 4,
    userSelect: 'none',
    ...(variant === 'primary' && {
      color: theme.colors.primary,
      background: 'rgb(238, 229, 255)',
    }),
    ...(variant === 'secondary' && {
      color: theme.colors.secondary,
      background: 'rgb(205, 238, 231)',
    }),
  }),
);
