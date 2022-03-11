import type { ReactNode } from 'react';

import type { IconProps } from '../Layout/Icon/types';

export type ButtonVariant = 'normal' | 'thin' | 'none';

export interface ButtonProps {
  id?: string;
  flex?: number;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  tooltip?: ReactNode;
  onClick?: () => void;
}

export type IconButtonProps = Omit<ButtonProps, 'children' | 'flex'> &
  IconProps;
