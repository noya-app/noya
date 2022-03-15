import { CSSObject } from 'styled-components';

// TODO: fix me after moving Theme to designsystem
import { Theme } from 'noya-web-designsystem';
import { CHECKBOX_WIDTH, CHECKBOX_RIGHT_INSET } from './constants';

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

      '& kbd': {
        color: 'white',
      },
    },
    '&:active': {
      background: theme.colors.primaryLight,
    },
    display: 'flex',
    alignItems: 'center',
  }),

  itemIndicatorStyle: {
    display: 'flex',
    alignItems: 'center',
    left: `-${CHECKBOX_WIDTH / 2}px`,
    position: 'relative',
    marginRight: `-${CHECKBOX_RIGHT_INSET}px`,
  } as CSSObject,

  contentStyle: ({
    theme,
    scrollable,
  }: {
    theme: Theme;
    scrollable?: boolean;
  }): CSSObject => ({
    borderRadius: 4,
    backgroundColor: theme.colors.popover.background,
    color: theme.colors.text,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
    padding: '4px',
    border: `1px solid ${theme.colors.divider}`,
    ...(scrollable && {
      height: '100%',
      maxHeight: 'calc(100vh - 80px)',
      overflow: 'hidden auto',
    }),
  }),
};
