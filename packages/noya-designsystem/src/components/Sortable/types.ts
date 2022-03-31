import type { ReactNode, Ref } from 'react';
import type { ListRenderItem, ViewStyle } from 'react-native';

import type { Point } from 'noya-geometry';

export type RelativeDropPosition = 'above' | 'below' | 'inside';

export type DropValidator = (
  sourceId: string,
  destinationId: string,
  position: RelativeDropPosition,
) => boolean;

export interface SortableItemProps<RefType> {
  id: string;
  disabled?: boolean;
  children: (props: {
    ref?: Ref<RefType>;
    relativeDropPosition?: RelativeDropPosition;
    [key: string]: any;
  }) => JSX.Element;
}

export interface SortableRootProps {
  keys: string[];
  children: ReactNode;
  renderOverlay?: (index: number) => ReactNode;
  onMoveItem?: (
    sourceIndex: number,
    destinationIndex: number,
    position: RelativeDropPosition,
  ) => void;
  acceptsDrop?: DropValidator;
}

export interface SortableListProps<T> {
  data: T[];
  keys: string[];
  style?: ViewStyle;
  scrollable?: boolean;
  renderItem: ListRenderItem<T>;
  acceptsDrop?: DropValidator;
  keyExtractor: (item: T, index: number) => string;
  renderOverlay?: (index: number) => ReactNode;
  onMoveItem?: (
    sourceIndex: number,
    destinationIndex: number,
    position: RelativeDropPosition,
  ) => void;
}

export interface ItemSize {
  width: number;
  height: number;
}

export interface ItemMeasurement {
  size: ItemSize;
  pos: Point;
}
