import type { Size } from 'noya-geometry';
import type { PageLayer } from 'noya-state';

export type LayerType = PageLayer['_class'];

export type LayerListItem = {
  type: LayerType | 'line';
  id: string;
  name: string;
  depth: number;
  expanded: boolean;
  selected: boolean;
  visible: boolean;
  hasClippingMask: boolean;
  shouldBreakMaskChain: boolean;
  isWithinMaskChain: boolean;
  isLocked: boolean;
};

export interface LayerListProps {
  size: Size;
  filter: string;

  // Expandable props
  id?: string;
  icon?: string;
}
