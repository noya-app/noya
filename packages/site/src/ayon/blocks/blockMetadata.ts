import { Size } from 'noya-geometry';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  checkboxSymbolId,
  headerBarSymbolId,
  heroSymbolV2Id,
  iconSymbolId,
  imageSymbolId,
  inputSymbolId,
  radioSymbolId,
  selectSymbolId,
  sidebarSymbolId,
  signInSymbolId,
  switchSymbolId,
  tableSymbolId,
  textareaSymbolId,
  writeSymbolId,
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
  [writeSymbolId]: {
    name: 'Write',
    category: 'element',
    preferredSize: { width: 300, height: 300 },
    preferredBlockText: 'Cats are great pets',
    preferredResolvedBlockText:
      'Cats are incredibly intelligent creatures with personalities all of their own. They make loyal and loving companions who can provide years of fun and joy. Cats come in all shapes, sizes, and colors and offer a variety of health benefits to their human owners. From their natural mouse-catching abilities to their playful antics, cats make terrific pet choices for a wide variety of households.',
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
  [headerBarSymbolId]: {
    name: 'Header Bar',
    category: 'application',
    preferredSize: { width: 1280, height: 80 },
  },
  [checkboxSymbolId]: {
    name: 'Checkbox',
    category: 'element',
    preferredSize: { width: 300, height: 30 },
  },
  [radioSymbolId]: {
    name: 'Radio',
    category: 'element',
    preferredSize: { width: 300, height: 30 },
  },
  [selectSymbolId]: {
    name: 'Select',
    category: 'element',
    preferredSize: { width: 300, height: 40 },
  },
  [textareaSymbolId]: {
    name: 'Textarea',
    category: 'element',
    preferredSize: { width: 240, height: 120 },
  },
  [inputSymbolId]: {
    name: 'Input',
    category: 'element',
    preferredSize: { width: 240, height: 40 },
  },
  [switchSymbolId]: {
    name: 'Switch',
    category: 'element',
    preferredSize: { width: 50, height: 35 },
  },
};
