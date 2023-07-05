import { ReactNode } from 'react';
import { IScoredItem } from './fuzzyScorer';

export type CompletionItem = { id: string; name: string; icon?: ReactNode };

export type CompletionListItem = CompletionItem & IScoredItem;
