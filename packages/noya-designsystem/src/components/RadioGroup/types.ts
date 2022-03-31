import type { ReactNode } from 'react';

export interface RadioGroupItemProps {
  value: string;
  tooltip?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupRootProps {
  id?: string;
  value: string;
  children: ReactNode;
  onValueChange: (value: string) => void;
}
