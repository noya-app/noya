import type { ReactNode } from 'react';

export interface ScrollableContextType {
  scrollEnabled: boolean;
  isAvailable: boolean;
  setScrollEnabled: (enabled: boolean) => void;
}

export interface ScrollableViewProps {
  children: ReactNode;
  // Allow platform specific props
  [key: string]: any;
}
