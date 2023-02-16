import { Element as SlateElement, Node, Transforms } from 'slate';
import { Blocks } from '../blocks';
import { layersWithoutSpacers } from '../blocks/zipWithoutSpacers';
import { CustomEditor, ParagraphElement } from './types';

export function withLayout(initialSymbolId: string, editor: CustomEditor) {
  const { normalizeNode } = editor;

  editor.symbolId = initialSymbolId;

  editor.normalizeNode = ([node, path]) => {
    const symbol = Blocks[editor.symbolId].symbol;

    const layers = layersWithoutSpacers(symbol);

    // If this is the editor
    if (path.length === 0) {
      // Ensure there's a node for each layer and the container
      while (editor.children.length < layers.length + 1) {
        const layer = layers[editor.children.length - 1];

        const childLayer = layer ? layer.symbolID : symbol.symbolID;

        const block = Blocks[childLayer];

        const paragraph: ParagraphElement = {
          type: 'paragraph',
          children: [{ text: '' }],
          label: block.symbol.name,
          symbolId: block.symbol.symbolID,
        };

        Transforms.insertNodes(editor, paragraph, {
          at: path.concat(editor.children.length),
        });
      }

      while (editor.children.length > layers.length + 1) {
        Transforms.removeNodes(editor, {
          at: path.concat(editor.children.length - 1),
        });
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        if (!SlateElement.isElement(child)) continue;

        const slateIndex = childPath[0];

        const layer = layers[slateIndex];

        if (layer) {
          const block = Blocks[layer.symbolID];

          const label = block.symbol.name;

          if (child.label === label) continue;

          const newProperties: Partial<SlateElement> = {
            label,
            symbolId: layer.symbolID,
          };

          Transforms.setNodes<SlateElement>(editor, newProperties, {
            at: childPath,
          });
        } else {
          if (!child.label) continue;

          const newProperties: Partial<SlateElement> = {
            label: undefined,
            symbolId: symbol.symbolID,
          };

          Transforms.setNodes<SlateElement>(editor, newProperties, {
            at: childPath,
          });
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
}
