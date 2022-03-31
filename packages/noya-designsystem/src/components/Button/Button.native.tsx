import React, { ForwardedRef, forwardRef, memo } from 'react';
import styled from 'styled-components';
import { View, TouchableOpacity } from 'react-native';

import { ButtonProps, ButtonVariant } from './types';

const ButtonElement = styled(View)<{
  variant: ButtonVariant;
  active: boolean;
  disabled: boolean;
  flex?: number;
}>(({ theme, active, disabled, variant, flex }) => ({
  ...theme.textStyles.small,
  flex: flex ?? '0 0 auto',
  position: 'relative',
  border: 0,
  outline: 'none',
  minWidth: variant === 'normal' ? 31 : 0,
  textAlign: 'left',
  borderRadius: 4,
  paddingTop: variant === 'none' ? 0 : 4,
  paddingRight: variant === 'none' ? 0 : variant === 'thin' ? 1 : 6,
  paddingBottom: variant === 'none' ? 0 : 4,
  paddingLeft: variant === 'none' ? 0 : variant === 'thin' ? 1 : 6,
  backgroundColor: active
    ? theme.colors.primary
    : variant === 'none'
    ? 'transparent'
    : theme.colors.inputBackground,
  opacity: disabled ? 0.25 : 1,
}));

const ButtonContent = styled(View)((p) => ({
  // Line height of small text - maybe figure out better way to ensure
  // icons don't have a smaller height
  minHeight: 19,
  alignItems: 'center',
  justifyContent: 'center',
}));

const ButtonRoot = forwardRef(function Button(
  {
    flex,
    tooltip,
    active = false,
    disabled = false,
    variant = 'normal',
    onClick,
    children,
    ...rest // Propagate any other props so this component works as a Slot
  }: ButtonProps,
  forwardedRef: ForwardedRef<TouchableOpacity>,
) {
  const buttonElement = (
    <TouchableOpacity onPress={onClick}>
      <ButtonElement
        ref={forwardedRef}
        flex={flex}
        active={active}
        disabled={disabled}
        variant={variant}
      >
        <ButtonContent>{children}</ButtonContent>
      </ButtonElement>
    </TouchableOpacity>
  );

  return buttonElement;
});

export const Button = memo(ButtonRoot);
