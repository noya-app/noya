import { Size } from 'noya-geometry';
import {
  heroSymbolV2Id,
  sidebarSymbolId,
  signInSymbolId,
  tableSymbolId,
} from './symbolIds';

export type BlockCategory = 'application' | 'marketing' | 'element';

export type BlockMetadata = {
  name: string;
  category: BlockCategory;
  preferredSize: Size;
};

// This is in a separate file so docs don't have to import Chakra components directly.
// Docs can import this synchronously and import(Ayon)
export const blockMetadata: Record<string, BlockMetadata> = {
  [heroSymbolV2Id]: {
    name: 'Hero',
    category: 'marketing',
    preferredSize: { width: 600, height: 400 },
  },
  [signInSymbolId]: {
    name: 'Sign In',
    category: 'application',
    preferredSize: { width: 350, height: 250 },
  },
  [tableSymbolId]: {
    name: 'Table',
    category: 'application',
    preferredSize: { width: 600, height: 400 },
  },
  [sidebarSymbolId]: {
    name: 'Sidebar',
    category: 'application',
    preferredSize: { width: 250, height: 600 },
  },
};
