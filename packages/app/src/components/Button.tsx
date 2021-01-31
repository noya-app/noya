import { memo, ReactNode } from 'react';
import styled from 'styled-components';
import * as Spacer from '../components/Spacer';

/* ----------------------------------------------------------------------------
 * Label
 * ------------------------------------------------------------------------- */

const ButtonLabel = styled.label(({ theme }) => ({
  ...theme.textStyles.small,
  fontSize: '11px',
  flex: '0 0 auto',
  minWidth: '0',
  letterSpacing: '0.4px',
}));

/* ----------------------------------------------------------------------------
 * Button
 * ------------------------------------------------------------------------- */

const ButtonButton = styled.button<{ active: boolean }>(
  ({ theme, active }) => ({
    ...theme.textStyles.small,
    flex: '0 0 auto',
    position: 'relative',
    border: '0',
    outline: 'none',
    minWidth: '0',
    textAlign: 'left',
    borderRadius: '4px',
    paddingTop: '4px',
    paddingRight: '6px',
    paddingBottom: '4px',
    paddingLeft: '6px',
    background: active ? theme.colors.inputBackground : 'transparent',
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.colors.primary}`,
    },
    display: 'flex',
    alignItems: 'center',
  }),
);

/* ----------------------------------------------------------------------------
 * Inner
 * ------------------------------------------------------------------------- */

const ButtonInner = styled.span(({ theme }) => ({
  // Line height of small text - maybe figure out better way to ensure
  // icons don't have a smaller height
  minHeight: '19px',
  display: 'flex',
  alignItems: 'center',
}));

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const ButtonContainer = styled.span(({ theme }) => ({
  flex: '0 0 auto',
  position: 'relative',
  border: '0',
  outline: 'none',
  minWidth: '0',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

interface ButtonRootProps {
  children: ReactNode;
  active?: boolean;
  label?: ReactNode;
  onClick?: () => void;
}

function Button({ label, active = false, onClick, children }: ButtonRootProps) {
  return (
    <ButtonContainer>
      <ButtonButton active={active} onClick={onClick}>
        <ButtonInner>{children}</ButtonInner>
      </ButtonButton>
      {label && (
        <>
          <Spacer.Vertical size={2} />
          <ButtonLabel>{label}</ButtonLabel>
        </>
      )}
    </ButtonContainer>
  );
}

export default memo(Button);
