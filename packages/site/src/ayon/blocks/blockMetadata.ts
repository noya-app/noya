import { Size } from 'noya-geometry';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  cardSymbolId,
  checkboxSymbolId,
  featureItemSymbolId,
  headerBarSymbolId,
  heading1SymbolId,
  heading2SymbolId,
  heading3SymbolId,
  heading4SymbolId,
  heading5SymbolId,
  heading6SymbolId,
  heroSymbolId,
  heroWithImageSymbolId,
  iconSymbolId,
  imageSymbolId,
  inputSymbolId,
  linkSymbolId,
  radioSymbolId,
  selectSymbolId,
  sidebarSymbolId,
  signInSymbolId,
  switchSymbolId,
  tableSymbolId,
  tagSymbolId,
  textareaSymbolId,
  textSymbolId,
  tileCardSymbolId,
  writeSymbolId,
} from '../symbols/symbolIds';

export type BlockCategory = 'application' | 'marketing' | 'element';

export type PreferredOverride = {
  symbolId: string;
  blockText: string;
  resolvedBlockText?: string;
};

export type BlockMetadata = {
  name: string;
  category: BlockCategory;
  preferredSize: Size;
  preferredBlockText?: string;
  preferredResolvedBlockText?: string;
  preferredOverrides?: PreferredOverride[];
  hideInDocs?: boolean;
};

const headingMetadata: BlockMetadata = {
  name: 'Heading',
  category: 'element',
  preferredSize: { width: 700, height: 100 },
  preferredBlockText: 'All About Cats',
};

const headingNMetadata: BlockMetadata = {
  ...headingMetadata,
  hideInDocs: true,
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
  [linkSymbolId]: {
    name: 'Link',
    category: 'element',
    preferredSize: { width: 200, height: 40 },
  },
  [boxSymbolId]: {
    name: 'Box',
    category: 'element',
    preferredSize: { width: 200, height: 200 },
  },
  [heroSymbolId]: {
    name: 'Hero',
    category: 'marketing',
    preferredSize: { width: 600, height: 400 },
  },
  [heroWithImageSymbolId]: {
    name: 'Hero with Image',
    category: 'marketing',
    preferredSize: { width: 1280, height: 720 },
  },
  [tagSymbolId]: {
    name: 'Tag',
    category: 'element',
    preferredSize: { width: 140, height: 30 },
  },
  [cardSymbolId]: {
    name: 'Card',
    category: 'marketing',
    preferredSize: { width: 250, height: 300 },
    preferredOverrides: [
      {
        symbolId: imageSymbolId,
        blockText: 'landscape',
        resolvedBlockText:
          'https://images.unsplash.com/photo-1514917860136-ee8b88e8c9c9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8bGFuZHNjYXBlLGJ1c3Rlcnx8fHx8fDE2Nzc2NDIxNDM&ixlib=rb-4.0.3&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=300',
      },
    ],
  },
  [tileCardSymbolId]: {
    name: 'Tile Card',
    category: 'marketing',
    preferredSize: { width: 250, height: 250 },
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
  [textSymbolId]: {
    name: 'Text',
    category: 'element',
    preferredSize: { width: 300, height: 150 },
    preferredBlockText:
      'Cats are great pets. They make loyal and loving companions who can provide years of fun and joy.',
  },
  [heading1SymbolId]: headingMetadata,
  [heading2SymbolId]: headingNMetadata,
  [heading3SymbolId]: headingNMetadata,
  [heading4SymbolId]: headingNMetadata,
  [heading5SymbolId]: headingNMetadata,
  [heading6SymbolId]: headingNMetadata,
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
    preferredSize: { width: 800, height: 80 },
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
  [featureItemSymbolId]: {
    name: 'Feature Item',
    category: 'marketing',
    preferredSize: { width: 400, height: 160 },
  },
};
