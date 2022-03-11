import React, { forwardRef, useContext, ForwardedRef } from 'react';
import styled from 'styled-components';
import { Property } from 'csstype';

import { memoize } from 'noya-utils';
import { TextInput, TextInputProps } from '../../internal/TextInput';
import { LabelPosition, InputFieldVariant } from '../types';
import { InputFieldContext } from '../context';
import { ignoredProps } from './utils';

const createCrossSVGString = memoize(
  (color: string) =>
    `<svg width='15' height='15' viewBox='0 0 15 15' fill='${color}' xmlns='http://www.w3.org/2000/svg'>
      <path d='M0.877075 7.49988C0.877075 3.84219 3.84222 0.877045 7.49991 0.877045C11.1576 0.877045 14.1227 3.84219 14.1227 7.49988C14.1227 11.1575 11.1576 14.1227 7.49991 14.1227C3.84222 14.1227 0.877075 11.1575 0.877075 7.49988ZM7.49991 1.82704C4.36689 1.82704 1.82708 4.36686 1.82708 7.49988C1.82708 10.6329 4.36689 13.1727 7.49991 13.1727C10.6329 13.1727 13.1727 10.6329 13.1727 7.49988C13.1727 4.36686 10.6329 1.82704 7.49991 1.82704ZM9.85358 5.14644C10.0488 5.3417 10.0488 5.65829 9.85358 5.85355L8.20713 7.49999L9.85358 9.14644C10.0488 9.3417 10.0488 9.65829 9.85358 9.85355C9.65832 10.0488 9.34173 10.0488 9.14647 9.85355L7.50002 8.2071L5.85358 9.85355C5.65832 10.0488 5.34173 10.0488 5.14647 9.85355C4.95121 9.65829 4.95121 9.3417 5.14647 9.14644L6.79292 7.49999L5.14647 5.85355C4.95121 5.65829 4.95121 5.3417 5.14647 5.14644C5.34173 4.95118 5.65832 4.95118 5.85358 5.14644L7.50002 6.79289L9.14647 5.14644C9.34173 4.95118 9.65832 4.95118 9.85358 5.14644Z' fill-rule='evenodd' clip-rule='evenodd'></path>
    </svg>`,
);

export const InputElement = styled(TextInput).withConfig({
  shouldForwardProp: (prop) => (ignoredProps.has(prop) ? false : true),
})<{
  labelPosition: LabelPosition;
  labelSize: number;
  hasLabel: boolean;
  hasDropdown: boolean;
  textAlign?: Property.TextAlign;
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
    color: disabled ? theme.colors.textDisabled : theme.colors.text,
    width: '0px', // Reset intrinsic width
    flex: '1 1 0px',
    position: 'relative',
    border: '0',
    outline: 'none',
    minWidth: '0',
    textAlign: textAlign ?? 'left',
    alignSelf: 'stretch',
    borderRadius: '4px',
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft:
      6 + (hasLabel && labelPosition === 'start' ? 6 + labelSize : 0) + 'px',
    paddingRight:
      6 +
      (hasLabel && labelPosition === 'end' ? 6 + labelSize : 0) +
      (hasDropdown ? 11 : 0) +
      'px',
    background: theme.colors.inputBackground,
    '&:focus': {
      boxShadow: `0 0 0 2px ${theme.colors.primary}`,
    },
    ...(variant === 'bare' && {
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    }),

    '&[type="search"]::-webkit-search-cancel-button': {
      appearance: 'none',
      height: '15px',
      width: '15px',
      background: `url("data:image/svg+xml;utf8,${createCrossSVGString(
        theme.colors.icon,
      )}") no-repeat`,
    },
  }),
);

const InputFieldInput = forwardRef(function InputFieldInput(
  props: TextInputProps & { textAlign?: Property.TextAlign; variant?: 'bare' },
  forwardedRef: ForwardedRef<HTMLInputElement>,
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
