import type { ReactNode } from 'react';

import type { MenuItem } from '../internal/Menu';

export type GridViewVariant = 'small' | 'large';

export interface ItemProps<MenuItemType extends string = string> {
  id: string;
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  children?: ReactNode;
  menuItems?: MenuItem<MenuItemType>[];
  onSelectMenuItem?: (value: MenuItemType) => void;
  onContextMenu?: () => void;
}

export interface GridViewRootProps {
  variant?: GridViewVariant;
  children: ReactNode;
  onClick: () => void;
}

export interface GridProps {
  variant: GridViewVariant;
}

export interface ItemContainerProps {
  selected: boolean;
}

export interface SectionTitleProps {
  last?: boolean;
}

export interface GridViewSectionProps {
  children?: ReactNode;
}

export interface GridViewSectionHeaderProps {
  title: string;
}
