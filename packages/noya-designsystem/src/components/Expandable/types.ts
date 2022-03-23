import type { ReactElement } from 'react';

export type ExpandablePosition = 'left' | 'right';

export interface Tab {
  id: string;
  icon: string;
}

export type ExpandableChild = ReactElement<Tab>;

export type ExpandableProps = {
  children: ExpandableChild | ExpandableChild[];
  position?: ExpandablePosition;
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
