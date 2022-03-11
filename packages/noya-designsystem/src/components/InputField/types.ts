import { ReactNode } from 'react';
import type { TextInputProps } from '../internal/TextInput';

export type LabelPosition = 'start' | 'end';

export type InputFieldVariant = 'normal' | 'bare';

export interface InputFieldLabelProps {
  children?: string;
}

export interface InputFieldRootProps {
  id?: string;
  flex?: string;
  children?: ReactNode;
  size?: number;
  labelPosition?: LabelPosition;
  labelSize?: number;
  hasDropdown?: boolean;
}

export type InputFieldNumberInputProps = Omit<
  TextInputProps,
  'value' | 'onChange' | 'onKeyDown' | 'onSubmit'
> & {
  value: number | undefined;
  onNudge?: (value: number) => void;
} & (
    | {
        onChange: (value: number) => void;
      }
    | {
        onSubmit: (value: number) => void;
      }
  );
