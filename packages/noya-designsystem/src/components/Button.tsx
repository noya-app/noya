import { ForwardedRef, forwardRef, memo, ReactNode } from 'react';
import styled from 'styled-components';
import { Tooltip } from '..';

type ButtonVariant = 'normal' | 'thin';

/* ----------------------------------------------------------------------------
 * Element
 * ------------------------------------------------------------------------- */

const ButtonElement = styled.button<{
  active: boolean;
  variant: ButtonVariant;
  full: boolean;
}>(({ theme, active, disabled, variant, full }) => ({
  ...theme.textStyles.small,
  flex: '0 0 auto',
  position: 'relative',
  border: '0',
  outline: 'none',
  minWidth: variant === 'thin' ? undefined : '31px',
  textAlign: 'left',
  borderRadius: '4px',
  paddingTop: '4px',
  paddingRight: variant === 'thin' ? '1px' : '6px',
  paddingBottom: variant === 'thin' ? '0px' : '4px',
  paddingLeft: variant === 'thin' ? '1px' : '6px',
  background: active ? theme.colors.primary : theme.colors.inputBackground,
  width: full ? '100%' : 'auto',
  color: active ? 'white' : theme.colors.text,
  opacity: disabled ? 0.25 : 1,
  '&:focus': {
    boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
  },
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
}));

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

interface ButtonRootProps {
  id: string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  tooltip?: ReactNode;
  full?: boolean;
  onClick?: () => void;
}

const Button = forwardRef(function Button(
  {
    id,
    tooltip,
    active = false,
    disabled = false,
    full = false,
    variant = 'normal',
    onClick,
    children,
  }: ButtonRootProps,
  forwardedRef: ForwardedRef<HTMLButtonElement>,
) {
  const buttonElement = (
    <ButtonElement
      id={id}
      full={full}
      ref={forwardedRef}
      active={active}
      disabled={disabled}
      variant={variant}
      onClick={onClick}
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

export default memo(Button);
