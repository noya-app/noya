import { ReactNode } from 'react';
import { IScoredItem } from './fuzzyScorer';

export type CompletionItem = {
  type?: undefined;
  id: string;
  name: string;
  icon?: ReactNode;
  alwaysInclude?: boolean;
};

export type CompletionSectionHeader = {
  type: 'sectionHeader';
  id: string;
  name: string;
  maxVisibleItems?: number;
};

export type CompletionListItem =
  | (CompletionItem & IScoredItem)
  | CompletionSectionHeader;
