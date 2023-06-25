import { readFileSync } from 'fs';
import { SketchModel } from 'noya-sketch-model';
import path from 'path';
import {
  Descendant,
  Editor,
  Selection,
  Element as SlateElement,
  Node as SlateNode,
  createEditor,
} from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { withOptions } from 'tree-visit';
import { Blocks } from '../ayon/blocks/blocks';
import { heroSymbolV2Id } from '../ayon/blocks/symbolIds';
import { extractBlockContent, fromContent } from '../ayon/editor/serialization';
import { withLayout } from '../ayon/editor/withLayout';

const traverse = withOptions({
  getChildren: (node: SlateNode): SlateNode[] => {
    if (SlateElement.isElement(node) || Editor.isEditor(node)) {
      return node.children;
    }
    return [];
  },
});

function selectionToString(selection: Selection) {
  if (!selection) return '(no selection)';
  return `(${selection.anchor.path.join('.')}:${
    selection.anchor.offset
  } -> ${selection.focus.path.join('.')}:${selection.focus.offset})`;
}

const diagram = (node: SlateNode) => {
  return traverse.diagram(node, (node) => {
    if (Editor.isEditor(node)) {
      return `Editor ${selectionToString(node.selection)}`;
    } else if (SlateElement.isElement(node)) {
      return Blocks[node.symbolId].symbol.name;
    } else {
      return SlateNode.string(node) || '(empty)';
    }
  });
};

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
    do_objectID: 'a',
    symbolID: heroSymbolV2Id,
    frame: SketchModel.rect({ width: 400, height: 400 }),
  });

  const editor = withLayout(
    { initialSymbolId: layer.symbolID, rootLayerId: layer.do_objectID },
    withHistory(withReact(createEditor())),
  );

  Editor.normalize(editor, { force: true });

  const nodes = fromContent(
    Blocks[layer.symbolID].symbol,
    extractBlockContent(layer),
  );

  expect(nodes.map(toBlockName)).toEqual([
    'Hero',
    'Text',
    'Heading1',
    'Heading4',
    'Button',
    'Link',
  ]);

  expect(editor.children.map(toBlockName)).toEqual([
    'Hero',
    'Text',
    'Heading1',
    'Heading4',
    'Button',
    'Link',
  ]);

  expect(editor.children).toEqual(nodes);
});

test('insert and delete text', () => {
  const layer = SketchModel.symbolInstance({
    symbolID: heroSymbolV2Id,
    frame: SketchModel.rect({ width: 400, height: 400 }),
  });

  const editor = withLayout(
    {
      initialSymbolId: layer.symbolID,
      rootLayerId: layer.do_objectID,
    },
    withHistory(withReact(createEditor())),
  );

  Editor.normalize(editor, { force: true });

  editor.selection = {
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  };

  expect(diagram(editor)).toMatchSnapshot('initial');

  editor.insertText('hi');

  expect(SlateNode.string(editor.children[1])).toEqual('hi');

  expect(diagram(editor)).toMatchSnapshot('with hi');

  editor.deleteBackward('character');

  expect(SlateNode.string(editor.children[1])).toEqual('h');

  editor.deleteBackward('character');

  expect(SlateNode.string(editor.children[1])).toEqual('');

  expect(diagram(editor)).toMatchSnapshot('delete');

  editor.deleteBackward('character');

  expect(diagram(editor)).toMatchSnapshot('final');
});
