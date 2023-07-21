import { SketchModel } from 'noya-sketch-model';
import { isWithinRectRange } from '../../infer/score';
import { buttonSymbol } from '../primitive/ButtonSymbol';
import {
  buttonSymbolId,
  sidebarItemSymbolId,
  sidebarSymbolId,
  textSymbolId,
} from '../symbolIds';

export const sidebarItemSymbol = SketchModel.symbolMaster({
  symbolID: sidebarItemSymbolId,
  name: 'Sidebar Item',
  blockDefinition: {
    hashtags: buttonSymbol.blockDefinition?.hashtags,
    primitiveSymbolID: buttonSymbolId,
    supportsBlockText: true,
    placeholderParameters: ['left', 'text'],
  },
  layers: [],
});

export const sidebarSymbol = SketchModel.symbolMaster({
  symbolID: sidebarSymbolId,
  name: 'Sidebar',
  blockDefinition: {
    placeholderParameters: [
      'flex-1',
      'flex-col',
      // 'items-stretch',
      'p-4',
      'gap-3',
    ],
    infer: ({ frame }) => {
      return Math.max(
        isWithinRectRange({
          rect: frame,
          minWidth: 120,
          minHeight: 300,
          maxWidth: 240,
          maxHeight: 2000,
        })
          ? 1
          : 0,
        0.1,
      );
    },
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: 'aa722c35-9ba4-4bf3-a5d0-f7d17f02c361',
      symbolID: textSymbolId,
      blockText: 'Title',
      blockParameters: ['h4', 'mb-4'],
    }),
    ...['Dashboard', 'Updates', 'Billing', 'Settings'].map((text, index) =>
      SketchModel.symbolInstance({
        symbolID: sidebarItemSymbolId,
        blockText: text,
        ...(index === 0 && { blockParameters: ['solid', 'left'] }),
      }),
    ),
  ],
});
