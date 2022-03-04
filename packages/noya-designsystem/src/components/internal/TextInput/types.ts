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
  autoComplete?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  spellCheck?: Booleanish;
}

export interface ControlledProps extends Props {
  onChange: (value: string) => void;
}

export interface SubmittableProps extends Props {
  onSubmit: (value: string) => void;
  allowSubmittingWithSameValue?: boolean;
}

export type TextInputProps = ControlledProps | SubmittableProps;
