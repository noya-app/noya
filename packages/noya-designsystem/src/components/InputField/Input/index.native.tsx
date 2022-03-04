import React, { forwardRef, useContext, ForwardedRef } from 'react';
import styled from 'styled-components';
import { TextInput as InputNative } from 'react-native';

import TextInput from '../../internal/TextInput/TextInput.native';
import { TextInputProps } from '../../internal/TextInput';
import { LabelPosition, InputFieldVariant } from '../types';
import { InputFieldContext } from '../context';
import { ignoredProps } from './utils';

type TextAlign = 'left' | 'right' | 'center' | 'justify'; //TextStyle['textAlign'];

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
    // ...theme.textStyles.small,
    // color: disabled ? theme.colors.textDisabled : theme.colors.text,
    // // width: '0px', // Reset intrinsic width
    // // flex: '1 1 0px',
    // position: 'relative',
    // // border: '0',
    // // outline: 'none',
    // // minWidth: '0',
    // textAlign: textAlign ?? 'left',
    // alignSelf: 'stretch',
    // borderRadius: 4,
    // paddingTop: 4,
    // paddingBottom: 4,
    // paddingLeft:
    //   6 + (hasLabel && labelPosition === 'start' ? 6 + labelSize : 0),
    // paddingRight:
    //   6 +
    //   (hasLabel && labelPosition === 'end' ? 6 + labelSize : 0) +
    //   (hasDropdown ? 11 : 0),
    // background: theme.colors.inputBackground,
    // // '&:focus': {
    // //   boxShadow: `0 0 0 2px ${theme.colors.primary}`,
    // // },
    // ...(variant === 'bare' && {
    //   paddingTop: 0,
    //   paddingRight: 0,
    //   paddingBottom: 0,
    //   paddingLeft: 0,
    // }),
    // '&[type="search"]::-webkit-search-cancel-button': {
    //   appearance: 'none',
    //   height: '15px',
    //   width: '15px',
    //   background: `url("data:image/svg+xml;utf8,${createCrossSVGString(
    //     theme.colors.icon,
    //   )}") no-repeat`,
    // },
  }),
);

export const InputFieldInput = forwardRef(function InputFieldInput(
  props: TextInputProps & { textAlign?: TextAlign; variant?: 'bare' },
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
