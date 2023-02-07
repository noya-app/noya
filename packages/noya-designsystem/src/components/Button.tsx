import React, {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  ReactNode,
  useCallback,
} from 'react';
import styled from 'styled-components';
import { Tooltip } from './Tooltip';

type ButtonVariant = 'normal' | 'primary' | 'thin' | 'none';

/* ----------------------------------------------------------------------------
 * Element
 * ------------------------------------------------------------------------- */

const ButtonElement = styled.button<{
  active: boolean;
  variant: ButtonVariant;
  flex?: CSSProperties['flex'];
}>(({ theme, active, disabled, variant, flex }) => ({
  WebkitAppRegion: 'no-drag',
  ...theme.textStyles.small,
  lineHeight: '1',
  flex: flex ?? '0 0 auto',
  position: 'relative',
  border: '0',
  outline: 'none',
  minWidth: variant === 'normal' ? '31px' : undefined,
  textAlign: 'left',
  borderRadius: '4px',
  paddingTop: variant === 'none' ? '0px' : '4px',
  paddingRight: variant === 'none' ? '0px' : variant === 'thin' ? '1px' : '6px',
  paddingBottom: variant === 'none' ? '0px' : '4px',
  paddingLeft: variant === 'none' ? '0px' : variant === 'thin' ? '1px' : '6px',
  background: active
    ? theme.colors.primary
    : variant === 'none' || variant === 'thin'
    ? 'transparent'
    : theme.colors.inputBackground,
  color: active ? 'white' : theme.colors.text,
  opacity: disabled ? 0.25 : 1,
  ...(variant === 'normal' && {
    '&:focus': {
      boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
    },
  }),
  '&:hover': {
    background: theme.colors.inputBackgroundLight,
  },
  '&:active': {
    background: theme.colors.activeBackground,
  },
  ...(variant === 'primary' && {
    background: theme.colors.primary,
    color: 'white',
    '&:hover': {
      background: theme.colors.primaryLight,
    },
    '&:active': {
      background: theme.colors.primary,
    },
  }),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '& *': {
    pointerEvents: 'none',
  },
}));

/* ----------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------- */

const ButtonContent = styled.span(({ theme }) => ({
  // Line height of small text - maybe figure out better way to ensure
  // icons don't have a smaller height
  minHeight: '19px',
  display: 'flex',
  alignItems: 'center',
  flex: '1',
  justifyContent: 'center',

  // Helps with alignment with the default small text
  lineHeight: '15px',
}));

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

export interface ButtonRootProps {
  id?: string;
  flex?: CSSProperties['flex'];
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  tooltip?: ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  onPointerDown?: (event: React.PointerEvent) => void;
}

export const Button = forwardRef(function Button(
  {
    id,
    flex,
    tooltip,
    active = false,
    disabled = false,
    variant = 'normal',
    onClick,
    children,
    ...rest // Propagate any other props so this component works as a Slot
  }: ButtonRootProps,
  forwardedRef: ForwardedRef<HTMLButtonElement>,
) {
  const buttonElement = (
    <ButtonElement
      ref={forwardedRef}
      id={id}
      flex={flex}
      active={active}
      disabled={disabled}
      variant={variant}
      onClick={onClick}
      // Prevent double clicking a button from triggering any callbacks in ancestors
      onDoubleClick={useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
      }, [])}
      {...rest}
    >
      <ButtonContent>{children}</ButtonContent>
    </ButtonElement>
  );

  return tooltip ? (
    <Tooltip content={tooltip}>{buttonElement}</Tooltip>
  ) : (
    buttonElement
  );
});
