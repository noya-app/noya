import type { ReactNode } from 'react';

import type { Size } from 'noya-geometry';
import type { MenuItem } from '../internal/Menu';
import type { RelativeDropPosition, DropValidator } from '../Sortable';

export type ListRowMarginType = 'none' | 'top' | 'bottom' | 'vertical';
export type ListRowPosition = 'only' | 'first' | 'middle' | 'last';

export type PressEventName = 'onClick' | 'onPointerDown';

export type ListRowContextValue = {
  marginType: ListRowMarginType;
  selectedPosition: ListRowPosition;
  sortable: boolean;
  expandable: boolean;
  indentation: number;
  pressEventName: PressEventName;
};

export interface ItemInfo {
  isDragging: boolean;
}

export interface ChildrenProps {
  children: ReactNode;
}

export interface RenderProps<T> {
  data: T[];
  renderItem: (item: T, index: number, info: ItemInfo) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  sortable?: boolean;
  virtualized?: Size;
}

export interface EditableRowProps {
  value: string;
  onSubmitEditing: (value: string) => void;
  autoFocus: boolean;
}

export interface IVirtualizedList {
  scrollToIndex(index: number): void;
}

export interface ListViewRootProps {
  onPress?: () => void;
  scrollable?: boolean;
  expandable?: boolean;
  onMoveItem?: (
    sourceIndex: number,
    destinationIndex: number,
    position: RelativeDropPosition,
  ) => void;
  indentation?: number;
  acceptsDrop?: DropValidator;
  pressEventName?: PressEventName;
}

export interface ListViewClickInfo {
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}

export interface ListViewRowProps<MenuItemType extends string = string> {
  id?: string;
  selected?: boolean;
  depth?: number;
  disabled?: boolean;
  draggable?: boolean;
  hovered?: boolean;
  sortable?: boolean;
  onPress?: (info: ListViewClickInfo) => void;
  onDoubleClick?: () => void;
  onHoverChange?: (isHovering: boolean) => void;
  children?: ReactNode;
  isSectionHeader?: boolean;
  menuItems?: MenuItem<MenuItemType>[];
  onSelectMenuItem?: (value: MenuItemType) => void;
  onContextMenu?: () => void;
}

export interface ListRowContainerProps {
  id?: string;
  marginType: ListRowMarginType;
  selected: boolean;
  selectedPosition: ListRowPosition;
  disabled: boolean;
  hovered: boolean;
  isSectionHeader: boolean;
  showsActiveState: boolean;
}
