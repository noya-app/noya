import type { ReactElement } from 'react';

export type ExpandablePosition = 'left' | 'right';

export interface ExpandableItem {
  name: string;
  icon: string;
  content: ReactElement;
}

export type ExpandableProps = {
  position?: ExpandablePosition;
  items: ExpandableItem[];
};

export interface ExpandableViewProps {
  position: ExpandablePosition;
}

export interface ActiveTabs {
  left?: string;
  right?: string;
}

export interface ExpandableContextType {
  activeTabs: ActiveTabs;
  setActiveTab: (position: ExpandablePosition, tab?: string) => void;
}
