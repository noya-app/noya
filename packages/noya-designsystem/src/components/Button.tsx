import { memo, ReactNode } from 'react';
import styled from 'styled-components';
import { Tooltip } from '..';

/* ----------------------------------------------------------------------------
 * Element
 * ------------------------------------------------------------------------- */

const ButtonElement = styled.button<{ active: boolean }>(
  ({ theme, active, disabled }) => ({
    ...theme.textStyles.small,
    flex: '0 0 auto',
    position: 'relative',
    border: '0',
    outline: 'none',
    minWidth: '31px',
    textAlign: 'left',
    borderRadius: '4px',
    paddingTop: '4px',
    paddingRight: '6px',
    paddingBottom: '4px',
    paddingLeft: '6px',
    background: active ? theme.colors.primary : theme.colors.inputBackground,
    color: active ? 'white' : theme.colors.text,
    opacity: disabled ? 0.25 : 1,
    '&:focus': {
      boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.primary}`,
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
);

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
  tooltip?: ReactNode;
  onClick?: () => void;
}

function Button({
  id,
  tooltip,
  active = false,
  disabled = false,
  onClick,
  children,
}: ButtonRootProps) {
  const buttonElement = (
    <ButtonElement
      id={id}
      active={active}
      disabled={disabled}
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
}

export default memo(Button);
