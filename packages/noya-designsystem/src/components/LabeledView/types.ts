import type { ReactNode } from 'react';

export interface LabeledViewProps {
  children: ReactNode;
  flex?: number;
  size?: number;
  label?: string;
}
