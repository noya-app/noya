import { CSSObject } from 'styled-components';
import { Theme } from '../../theme';

export const SEPARATOR_ITEM = 'separator';

export type RegularMenuItem<T extends string> = {
  value: T;
  title: string;
  checked?: boolean;
};

export type MenuItem<T extends string> =
  | typeof SEPARATOR_ITEM
  | RegularMenuItem<T>;

export const styles = {
  separatorStyle: ({ theme }: { theme: Theme }): CSSObject => ({
    height: '1px',
    backgroundColor: theme.colors.divider,
    margin: '4px 8px',
  }),

  itemStyle: ({
    theme,
    disabled,
  }: {
    theme: Theme;
    disabled?: boolean;
  }): CSSObject => ({
    ...theme.textStyles.small,
    fontWeight: 500,
    fontSize: '0.8rem',
    flex: '0 0 auto',
    userSelect: 'none',
    cursor: 'pointer',
    borderRadius: '3px',
    padding: '4px 8px',
    ...(disabled && {
      color: theme.colors.textDisabled,
    }),
    '&:focus': {
      outline: 'none',
      color: 'white',
      backgroundColor: theme.colors.primary,
    },
    display: 'flex',
    alignItems: 'center',
  }),

  contentStyle: ({ theme }: { theme: Theme }): CSSObject => ({
    borderRadius: 4,
    backgroundColor: theme.colors.popover.background,
    color: theme.colors.text,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
    padding: '4px',
    border: `1px solid ${theme.colors.divider}`,
  }),
};
