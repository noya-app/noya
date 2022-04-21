import type { ReactNode, JSXElementConstructor } from 'react';

export interface RootProps {
  onOpenChange?: (isOpen: boolean) => void;
  children: ReactNode;
}

export interface TriggerProps {
  children: ReactNode;
}

export interface ContentProps {
  children: ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  align?: 'end' | 'start' | 'center';
}

export interface ElementDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ContextType {
  isOpen: boolean;
  triggerDimensions: ElementDimensions;
  onChangeOpen: (isOpen: boolean) => void;
  setTriggerDimensions: (dimensions: ElementDimensions) => void;
}

export interface PopoverType {
  Root: JSXElementConstructor<RootProps>;
  Trigger: JSXElementConstructor<TriggerProps>;
  Content: JSXElementConstructor<ContentProps>;
}
