import { readFileSync } from 'fs';
import { SketchModel } from 'noya-sketch-model';
import path from 'path';
import {
  Descendant,
  Editor,
  Element as SlateElement,
  createEditor,
} from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { Blocks } from '../ayon/blocks/blocks';
import { heroSymbolV2Id } from '../ayon/blocks/symbolIds';
import { extractBlockContent, fromSymbol } from '../ayon/editor/serialization';
import { withLayout } from '../ayon/editor/withLayout';

// Jest doesn't know how to import a text file, so we mock it
jest.mock('../../safelist.txt', () => {
  return {
    default: readFileSync(path.join(__dirname, '../../safelist.txt'), 'utf8'),
  };
});

function toBlockName(node: Descendant) {
  if (!SlateElement.isElement(node)) {
    throw new Error('Expected node (expected an element)');
  }

  const block = Blocks[node.symbolId];

  return block.symbol.name;
}

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

  const nodes = fromSymbol(
    Blocks[layer.symbolID].symbol,
    extractBlockContent(layer),
  );

  expect(editor.children.map(toBlockName)).toEqual([
    'Text',
    'Heading1',
    'Heading4',
    'Button',
    'Link',
    'Hero',
  ]);

  expect(editor.children).toEqual(nodes);
});
