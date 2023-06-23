import Sketch from 'noya-file-format';
import { Layers } from 'noya-state';
import { Node, Element as SlateElement, Transforms } from 'slate';
import { Blocks } from '../blocks/blocks';
import { flattenPassthroughLayers } from '../blocks/flattenPassthroughLayers';
import { CustomEditor, ParagraphElement } from './types';

export function insertBlock(
  editor: CustomEditor,
  layer: Sketch.SymbolInstance | Sketch.SymbolMaster,
  path: number[],
) {
  const block = Blocks[layer.symbolID];

  const paragraph: ParagraphElement = {
    type: 'paragraph',
    children: [{ text: '' }],
    label: block.symbol.name,
    symbolId: block.symbol.symbolID,
    placeholder: Layers.isSymbolInstance(layer) ? layer.blockText : undefined,
    layerId: layer ? layer.do_objectID : undefined,
  };

  Transforms.insertNodes(editor, paragraph, {
    at: path.concat(editor.children.length),
  });
}

export function setNestedNodeProperties(
  editor: CustomEditor,
  layer: Sketch.SymbolInstance,
  path: number[],
  node: ParagraphElement,
) {
  const block = Blocks[layer.symbolID];

  const label = block.symbol.name;
  const placeholder = layer ? layer.blockText : undefined;

  if (
    node.label === label &&
    node.placeholder === placeholder &&
    node.layerId === layer.do_objectID
  ) {
    return;
  }

  const newProperties: Partial<SlateElement> = {
    label,
    symbolId: layer.symbolID,
    placeholder,
    layerId: layer.do_objectID,
  };

  Transforms.setNodes<SlateElement>(editor, newProperties, {
    at: path,
  });
}

export function setRootNodeProperties(
  editor: CustomEditor,
  layer: Sketch.SymbolMaster,
  path: number[],
  node: ParagraphElement,
) {
  if (!node.label) return;

  const newProperties: Partial<SlateElement> = {
    label: undefined,
    symbolId: layer.symbolID,
    placeholder: undefined,
    layerId: undefined,
  };

  Transforms.setNodes<SlateElement>(editor, newProperties, {
    at: path,
  });
}

export function withLayout(initialSymbolId: string, editor: CustomEditor) {
  const { normalizeNode } = editor;

  editor.symbolId = initialSymbolId;

  editor.normalizeNode = ([node, path]) => {
    const symbol = Blocks[editor.symbolId].symbol;

    const layers = flattenPassthroughLayers(symbol);

    // If this is the editor
    if (path.length === 0) {
      // Ensure there's a node for each layer and the container
      while (editor.children.length < layers.length + 1) {
        insertBlock(editor, layers[editor.children.length - 1] ?? symbol, path);
      }

      while (editor.children.length > layers.length + 1) {
        Transforms.removeNodes(editor, {
          at: path.concat(editor.children.length - 1),
        });
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        if (!SlateElement.isElement(child)) continue;

        const layer = layers[childPath[0]];

        if (layer) {
          setNestedNodeProperties(editor, layer, childPath, child);
        } else {
          setRootNodeProperties(editor, symbol, childPath, child);
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
}
