import { MouseEventHandler, PointerEventHandler } from 'react';

type Booleanish = boolean | 'true' | 'false';

export interface KeyDownParams {
  key: string;
  shiftKey: boolean;
  altKey: boolean;
}

interface Props {
  id?: string;
  style?: any;
  className?: string;
  type?: 'text' | 'search';
  disabled?: boolean;
  value: string;
  placeholder?: string;
  onKeyDown?: (params: KeyDownParams) => void;
  // TODO: provide a common interface for both platforms?
  onClick?: MouseEventHandler;
  onPointerDown?: PointerEventHandler;
  autoComplete?:
    | 'birthdate-day'
    | 'birthdate-full'
    | 'birthdate-month'
    | 'birthdate-year'
    | 'cc-csc'
    | 'cc-exp'
    | 'cc-exp-day'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-number'
    | 'email'
    | 'gender'
    | 'name'
    | 'name-family'
    | 'name-given'
    | 'name-middle'
    | 'name-middle-initial'
    | 'name-prefix'
    | 'name-suffix'
    | 'password'
    | 'password-new'
    | 'postal-address'
    | 'postal-address-country'
    | 'postal-address-extended'
    | 'postal-address-extended-postal-code'
    | 'postal-address-locality'
    | 'postal-address-region'
    | 'postal-code'
    | 'street-address'
    | 'sms-otp'
    | 'tel'
    | 'tel-country-code'
    | 'tel-national'
    | 'tel-device'
    | 'username'
    | 'username-new'
    | 'off';
  autoCapitalize?: string;
  autoCorrect?: string;
  spellCheck?: Booleanish;
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'decimal-pad'
    | 'numeric'
    | 'email-address'
    | 'phone-pad';
}

export interface ControlledProps extends Props {
  onChange: (value: string) => void;
}

export interface SubmittableProps extends Props {
  onSubmit: (value: string) => void;
  allowSubmittingWithSameValue?: boolean;
}

export type TextInputProps = ControlledProps | SubmittableProps;
