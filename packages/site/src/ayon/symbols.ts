import { SketchModel } from 'noya-sketch-model';

export const ayonLibraryId = 'e6cc1791-d9c1-410a-84b6-b381fe058bef';

export const buttonSymbolId = 'cdf2346b-cb21-4f23-8d93-7c4fb2e3a5a0';
export const avatarSymbolId = 'fe7dd31d-b140-4e4c-ab7b-90fbe833936b';
export const boxSymbolId = '9dc8f73e-64f2-43f2-8902-af334a7a17cd';
export const checkboxSymbolId = 'fa181f85-04c2-4524-ad4f-779240cb44b0';
export const iconButtonSymbolId = '4343c29a-a05d-421e-9eb6-16365254a5b9';
export const inputSymbolId = '4db59e9d-9bc1-4146-af0a-ec8bf801485f';
export const switchSymbolId = '30a8ac0b-18dd-4744-bee1-77852ec4d3d8';
export const textSymbolId = 'a1f7266f-50cc-416f-9ed2-4af4bca30257';
export const imageSymbolId = 'd91ba1e3-7e64-4966-9cc1-daa48f989178';
export const headingSymbolId = '955f4cb1-7879-4331-a359-a21a031147cb';

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

export const iconButtonSymbol = SketchModel.symbolMaster({
  symbolID: iconButtonSymbolId,
  name: 'Icon Button',
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

export const headingSymbol = SketchModel.symbolMaster({
  symbolID: headingSymbolId,
  name: 'Heading',
});

export const allAyonSymbols = [
  buttonSymbol,
  avatarSymbol,
  boxSymbol,
  checkboxSymbol,
  iconButtonSymbol,
  inputSymbol,
  switchSymbol,
  textSymbol,
  imageSymbol,
  headingSymbol,
];
