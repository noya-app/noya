import { Size } from 'noya-geometry';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  heroSymbolV2Id,
  iconSymbolId,
  imageSymbolId,
  sidebarSymbolId,
  signInSymbolId,
  tableSymbolId,
} from './symbolIds';

export type BlockCategory = 'application' | 'marketing' | 'element';

export type BlockMetadata = {
  name: string;
  category: BlockCategory;
  preferredSize: Size;
  preferredBlockText?: string;
  preferredResolvedBlockText?: string;
};

// This is in a separate file so docs don't have to import Chakra components directly.
// Docs can import this synchronously and import(Ayon)
export const blockMetadata: Record<string, BlockMetadata> = {
  [avatarSymbolId]: {
    name: 'Avatar',
    category: 'element',
    preferredSize: { width: 64, height: 64 },
  },
  [buttonSymbolId]: {
    name: 'Button',
    category: 'element',
    preferredSize: { width: 200, height: 40 },
  },
  [boxSymbolId]: {
    name: 'Box',
    category: 'element',
    preferredSize: { width: 200, height: 200 },
  },
  [heroSymbolV2Id]: {
    name: 'Hero',
    category: 'marketing',
    preferredSize: { width: 600, height: 400 },
  },
  [iconSymbolId]: {
    name: 'Icon',
    category: 'element',
    preferredSize: { width: 48, height: 48 },
  },
  [imageSymbolId]: {
    name: 'Image',
    category: 'element',
    preferredSize: { width: 300, height: 300 },
    preferredBlockText: 'landscape',
    preferredResolvedBlockText:
      'https://images.unsplash.com/photo-1514917860136-ee8b88e8c9c9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8bGFuZHNjYXBlLGJ1c3Rlcnx8fHx8fDE2Nzc2NDIxNDM&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=300',
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
