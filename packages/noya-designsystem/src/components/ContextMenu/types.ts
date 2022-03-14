import type { ReactNode, ReactElement } from 'react';
import type { MenuItem } from '../internal/Menu';

export interface MenuItemProps<T extends string> {
  value?: T;
  children?: ReactNode;
  onSelect: (value: T) => void;
  checked: boolean;
  disabled: boolean;
  indented: boolean;
  shortcut?: string;
  icon?: ReactElement;
  items?: MenuItem<T>[];
}

export interface MenuProps<T extends string> {
  children: ReactNode;
  items: MenuItem<T>[];
  onSelect: (value: T) => void;
  isNested?: boolean;
  shouldBindKeyboardShortcuts?: boolean;
}
