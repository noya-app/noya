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
