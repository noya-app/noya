import type { ReactNode } from 'react';

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
