import { SketchModel } from 'noya-sketch-model';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  cardSymbolId,
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
  name: 'Hero V1 (update available)',
});

export const heroSymbolV2 = SketchModel.symbolMaster({
  symbolID: heroSymbolV2Id,
  name: 'Hero',
  defaultBlockText: '#flex-col #center #bg-transparent #p-4 #gap-3',
  layers: [
    SketchModel.symbolInstance({
      do_objectID: 'ef2d5b26-aa1c-40d3-8bab-37c10bccc5cb',
      symbolID: heading2SymbolId,
      blockText: 'Create, iterate, inspire. #text-center',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'aa722c35-9ba4-4bf3-a5d0-f7d17f02c361',
      symbolID: textSymbolId,
      blockText: 'Turn great ideas into new possibilities. #text-center #mb-4',
    }),
    SketchModel.symbolInstance({
      do_objectID: '6b386c69-d6cf-4c2f-ae06-c92af43268d5',
      symbolID: buttonSymbolId,
      blockText: 'Get started #primary #md',
    }),
  ],
});

export const cardSymbol = SketchModel.symbolMaster({
  symbolID: cardSymbolId,
  name: 'Card',
  defaultBlockText: '#flex-col #bg-white #p-4 #shadow #rounded-md',
  layers: [
    SketchModel.symbolInstance({
      do_objectID: '66a7337d-3e71-48de-b415-7d1551cd7be1',
      symbolID: imageSymbolId,
      blockText: 'cat #aspect-video #rounded-lg',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'f7a4bcee-9e41-455a-b29e-7ba3598eeb26',
      symbolID: heading5SymbolId,
      blockText: 'News #mt-4',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'f5b4c896-fd40-4141-999e-90eef2c0a8f3',
      symbolID: textSymbolId,
      blockText:
        'Here you can explore the latest news and information. #flex-1 #mt-1',
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
