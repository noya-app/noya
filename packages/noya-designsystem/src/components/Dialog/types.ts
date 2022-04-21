import type { ReactNode } from 'react';

export interface IDialog {
  containsElement: (element: HTMLElement) => boolean;
}

export interface DialogProps {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenAutoFocus?: (event: {
    stopPropagation: () => void;
    preventDefault: () => void;
  }) => void;
}
