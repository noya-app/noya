import type { ReactNode } from 'react';

export interface ScrollAreaProps {
  children?: ReactNode | ((scrollElementRef: HTMLDivElement) => ReactNode);
}
