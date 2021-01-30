import { memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';

/* ----------------------------------------------------------------------------
 * Label
 * ------------------------------------------------------------------------- */

const LabelContainer = styled.label(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingRight: '6px',
  pointerEvents: 'none',
  fontWeight: 'bold',
  fontSize: '60%',
  opacity: 0.5,
}));

interface InputFieldLabelProps {
  children?: ReactNode;
}

function InputFieldLabel({ children = false }: InputFieldLabelProps) {
  return <LabelContainer>{children}</LabelContainer>;
}

/* ----------------------------------------------------------------------------
 * Input
 * ------------------------------------------------------------------------- */

const InputElement = styled.input(({ theme }) => ({
  ...theme.textStyles.small,
  width: '0px', // Reset intrinsic width
  flex: '1 1 0px',
  position: 'relative',
  border: '0',
  outline: 'none',
  minWidth: '0',
  textAlign: 'left',
  alignSelf: 'stretch',
  borderRadius: '4px',
  paddingTop: '4px',
  paddingRight: '18px',
  paddingBottom: '4px',
  paddingLeft: '6px',
  background: theme.colors.inputBackground,
  '&:focus': {
    boxShadow: `0 0 0 2px ${theme.colors.primary}`,
  },
}));

interface InputFieldInputProps {
  value: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
}

function InputFieldInput({ value, children, onChange }: InputFieldInputProps) {
  return (
    <InputElement
      value={value}
      onChange={useCallback(
        (event) => {
          onChange?.(event.target.value);
        },
        [onChange],
      )}
    >
      {children}
    </InputElement>
  );
}

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootContainer = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
}));

interface InputFieldRootProps {
  children?: ReactNode;
}

function InputFieldRoot({ children }: InputFieldRootProps) {
  return <RootContainer>{children}</RootContainer>;
}

export const Input = memo(InputFieldInput);
export const Label = memo(InputFieldLabel);
export const Root = memo(InputFieldRoot);
