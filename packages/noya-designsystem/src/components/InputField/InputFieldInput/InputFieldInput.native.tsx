import React, { forwardRef, useContext, ForwardedRef } from 'react';
import { TextInput as InputNative } from 'react-native';
import styled from 'styled-components';

import TextInput from '../../internal/TextInput/TextInput.native';
import { TextInputProps } from '../../internal/TextInput';
import { LabelPosition, InputFieldVariant } from '../types';
import { InputFieldContext } from '../context';
import { ignoredProps } from './utils';

type TextAlign = 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';

function parseTextAlign(
  textAlign: string,
): Exclude<TextAlign, 'start' | 'end'> {
  if (textAlign === 'start') {
    return 'left';
  }

  if (textAlign === 'end') {
    return 'right';
  }

  return textAlign as Exclude<TextAlign, 'start' | 'end'>;
}

export const InputElement = styled(TextInput).withConfig({
  shouldForwardProp: (prop) => (ignoredProps.has(prop) ? false : true),
})<{
  labelPosition: LabelPosition;
  labelSize: number;
  hasLabel: boolean;
  hasDropdown: boolean;
  textAlign?: TextAlign;
  disabled?: boolean;
  variant?: InputFieldVariant;
}>(
  ({
    theme,
    labelPosition,
    labelSize,
    hasDropdown,
    textAlign,
    disabled,
    hasLabel,
    variant = 'normal',
  }) => ({
    ...theme.textStyles.small,
    flex: 1,
    color: disabled ? theme.colors.textDisabled : theme.colors.text,
    textAlign: parseTextAlign(textAlign ?? 'left'),
    borderRadius: 4,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft:
      6 + (hasLabel && labelPosition === 'start' ? 6 + labelSize : 0),
    paddingRight:
      6 +
      (hasLabel && labelPosition === 'end' ? 6 + labelSize : 0) +
      (hasDropdown ? 11 : 0),
    background: theme.colors.inputBackground,
    ...(variant === 'bare' && {
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    }),
  }),
);

type Props = TextInputProps & { textAlign?: TextAlign; variant?: 'bare' };

const InputFieldInput = forwardRef(function InputFieldInput(
  props: Props,
  forwardedRef: ForwardedRef<InputNative>,
) {
  const { labelPosition, labelSize, hasDropdown, hasLabel } =
    useContext(InputFieldContext);

  return (
    <InputElement
      ref={forwardedRef}
      labelPosition={labelPosition}
      labelSize={labelSize}
      hasLabel={hasLabel}
      hasDropdown={hasDropdown}
      {...props}
    />
  );
});

export default InputFieldInput;
