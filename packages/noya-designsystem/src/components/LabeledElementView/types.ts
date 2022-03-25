import type { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  renderLabel: (provided: { id: string; index: number }) => ReactNode;
}
