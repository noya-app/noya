import type { ReactNode } from 'react';

import type { IconProps } from '../Layout/Icon/types';
import type { PressableHandler } from 'noya-react-utils';

export type ButtonVariant = 'normal' | 'thin' | 'none';

export interface ButtonProps {
  id?: string;
  flex?: number | string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  tooltip?: ReactNode;
  onClick?: PressableHandler;
}

export type IconButtonProps = Omit<ButtonProps, 'children' | 'flex'> &
  IconProps;
