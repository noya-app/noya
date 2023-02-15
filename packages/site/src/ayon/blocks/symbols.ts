import { SketchModel } from 'noya-sketch-model';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  checkboxSymbolId,
  headerBarSymbolId,
  heading1SymbolId,
  heading2SymbolId,
  heading3SymbolId,
  heading4SymbolId,
  heading5SymbolId,
  heading6SymbolId,
  heroSymbolId,
  heroSymbolV2Id,
  iconSymbolId,
  imageSymbolId,
  inputSymbolId,
  radioSymbolId,
  selectSymbolId,
  sidebarSymbolId,
  spacerSymbolId,
  switchSymbolId,
  tableSymbolId,
  textareaSymbolId,
  textSymbolId,
  writeSymbolId,
} from './symbolIds';

export const buttonSymbol = SketchModel.symbolMaster({
  symbolID: buttonSymbolId,
  name: 'Button',
});

export const avatarSymbol = SketchModel.symbolMaster({
  symbolID: avatarSymbolId,
  name: 'Avatar',
});

export const boxSymbol = SketchModel.symbolMaster({
  symbolID: boxSymbolId,
  name: 'Box',
});

export const checkboxSymbol = SketchModel.symbolMaster({
  symbolID: checkboxSymbolId,
  name: 'Checkbox',
});

export const inputSymbol = SketchModel.symbolMaster({
  symbolID: inputSymbolId,
  name: 'Input',
});

export const switchSymbol = SketchModel.symbolMaster({
  symbolID: switchSymbolId,
  name: 'Switch',
});

export const textSymbol = SketchModel.symbolMaster({
  symbolID: textSymbolId,
  name: 'Text',
});

export const imageSymbol = SketchModel.symbolMaster({
  symbolID: imageSymbolId,
  name: 'Image',
});

export const heading1Symbol = SketchModel.symbolMaster({
  symbolID: heading1SymbolId,
  name: 'Heading1',
});

export const heading2Symbol = SketchModel.symbolMaster({
  symbolID: heading2SymbolId,
  name: 'Heading2',
});

export const heading3Symbol = SketchModel.symbolMaster({
  symbolID: heading3SymbolId,
  name: 'Heading3',
});

export const heading4Symbol = SketchModel.symbolMaster({
  symbolID: heading4SymbolId,
  name: 'Heading4',
});

export const heading5Symbol = SketchModel.symbolMaster({
  symbolID: heading5SymbolId,
  name: 'Heading5',
});

export const heading6Symbol = SketchModel.symbolMaster({
  symbolID: heading6SymbolId,
  name: 'Heading6',
});

export const writeSymbol = SketchModel.symbolMaster({
  symbolID: writeSymbolId,
  name: 'Write',
});

export const headerBarSymbol = SketchModel.symbolMaster({
  symbolID: headerBarSymbolId,
  name: 'HeaderBar',
});

export const heroSymbol = SketchModel.symbolMaster({
  symbolID: heroSymbolId,
  name: 'HeroLegacyV1',
});

export const heroSymbolV2 = SketchModel.symbolMaster({
  symbolID: heroSymbolV2Id,
  name: 'Hero',
  defaultBlockText:
    '#flex-col #items-center #justify-center #bg-transparent #p-4 #gap-3',
  layers: [
    SketchModel.symbolInstance({
      symbolID: heading2SymbolId,
      blockText: 'Create, iterate, inspire. #text-center',
    }),
    SketchModel.symbolInstance({
      symbolID: textSymbolId,
      blockText: 'Turn great ideas into new possibilities.',
    }),
    SketchModel.symbolInstance({
      symbolID: spacerSymbolId,
      blockText: '#basis-0',
    }),
    SketchModel.symbolInstance({
      symbolID: buttonSymbolId,
      blockText: 'Get started #primary #md',
    }),
  ],
});

export const iconSymbol = SketchModel.symbolMaster({
  symbolID: iconSymbolId,
  name: 'Icon',
});

export const sidebarSymbol = SketchModel.symbolMaster({
  symbolID: sidebarSymbolId,
  name: 'Sidebar',
});

export const tableSymbol = SketchModel.symbolMaster({
  symbolID: tableSymbolId,
  name: 'Table',
});

export const selectSymbol = SketchModel.symbolMaster({
  symbolID: selectSymbolId,
  name: 'Select',
});

export const radioSymbol = SketchModel.symbolMaster({
  symbolID: radioSymbolId,
  name: 'Radio',
});

export const textareaSymbol = SketchModel.symbolMaster({
  symbolID: textareaSymbolId,
  name: 'Textarea',
});

export const spacerSymbol = SketchModel.symbolMaster({
  symbolID: spacerSymbolId,
  name: 'Spacer',
});

export const allAyonSymbols = [
  buttonSymbol,
  avatarSymbol,
  boxSymbol,
  checkboxSymbol,
  inputSymbol,
  switchSymbol,
  textSymbol,
  imageSymbol,
  heading1Symbol,
  heading2Symbol,
  heading3Symbol,
  heading4Symbol,
  heading5Symbol,
  heading6Symbol,
  writeSymbol,
  headerBarSymbol,
  heroSymbol,
  heroSymbolV2,
  iconSymbol,
  sidebarSymbol,
  tableSymbol,
  selectSymbol,
  radioSymbol,
  textareaSymbol,
  // spacerSymbol,
];
