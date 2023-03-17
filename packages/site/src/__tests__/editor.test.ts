import { readFileSync } from 'fs';
import { SketchModel } from 'noya-sketch-model';
import { Layers, Overrides } from 'noya-state';
import path from 'path';
import { createEditor, Editor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { Blocks } from '../ayon/blocks/blocks';
import { heading5SymbolId, heroSymbolV2Id } from '../ayon/blocks/symbolIds';
import { fromSymbol } from '../ayon/editor/serialization';
import { withLayout } from '../ayon/editor/withLayout';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../safelist.txt', () => {
  return {
    default: readFileSync(path.join(__dirname, '../../safelist.txt'), 'utf8'),
  };
});

test('serializes empty block', () => {
  const layer = SketchModel.symbolInstance({
    symbolID: heroSymbolV2Id,
    frame: SketchModel.rect({
      width: 400,
      height: 400,
    }),
  });

  const editor = withLayout(
    layer.symbolID,
    withHistory(withReact(createEditor())),
  );

  Editor.normalize(editor, { force: true });

  const nodes = fromSymbol(Blocks[layer.symbolID].symbol, layer);

  expect(editor.children).toEqual(nodes);
});

test('serializes block with layer text', () => {
  const instance = SketchModel.symbolInstance({
    symbolID: heroSymbolV2Id,
    frame: SketchModel.rect({
      width: 400,
      height: 400,
    }),
  });

  Blocks[instance.symbolID].symbol.layers
    .filter(Layers.isSymbolInstance)
    .filter((layer) => layer.symbolID === heading5SymbolId)
    .forEach((layer) => {
      instance.overrideValues.push(
        SketchModel.overrideValue({
          overrideName: Overrides.encodeName([layer.do_objectID], 'blockText'),
          value: 'hello',
        }),
      );
    });

  const nodes = fromSymbol(Blocks[instance.symbolID].symbol, instance);

  expect(nodes).toMatchSnapshot();
});
