import { Node, Element as SlateElement, Transforms } from 'slate';
import { Blocks } from '../blocks/blocks';
import { flattenPassthroughLayers } from '../blocks/flattenPassthroughLayers';
import { CustomEditor, ParagraphElement } from './types';

export function setNodeProperties({
  editor,
  symbolId,
  layerId,
  isRoot,
  path,
  node,
}: {
  editor: CustomEditor;
  symbolId: string;
  layerId: string;
  isRoot: boolean;
  path: number[];
  node: ParagraphElement;
}) {
  // if (
  //   node.layerId === layerId &&
  //   node.symbolId === symbolId &&
  //   node.isRoot === isRoot
  // ) {
  //   return;
  // }

  const newProperties: Partial<SlateElement> = {
    symbolId,
    layerId,
    isRoot,
  };

  Transforms.setNodes<SlateElement>(editor, newProperties, {
    at: path,
  });
}

export function withLayout(
  options: {
    initialSymbolId: string;
    rootLayerId: string;
  },
  editor: CustomEditor,
) {
  const { normalizeNode } = editor;

  editor.symbolId = options.initialSymbolId;

  editor.normalizeNode = ([node, path]) => {
    const symbol = Blocks[editor.symbolId].symbol;

    const layers = flattenPassthroughLayers(symbol);

    // If this is the editor
    if (path.length === 0) {
      // Ensure there's a node for each layer and the container
      while (editor.children.length < layers.length + 1) {
        const isRoot = editor.children.length === 0;

        const layer = layers[editor.children.length - 1];

        const paragraph: ParagraphElement = {
          type: 'paragraph',
          children: [{ text: '' }],
          symbolId: isRoot ? options.initialSymbolId : layer.symbolID,
          layerId: isRoot ? options.rootLayerId : layer.do_objectID,
          isRoot,
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

        const index = childPath[0];

        if (index === 0) {
          setNodeProperties({
            editor,
            node: child,
            path: childPath,
            layerId: options.rootLayerId,
            symbolId: options.initialSymbolId,
            isRoot: true,
          });
        } else {
          const layer = layers[index - 1];

          setNodeProperties({
            editor,
            node: child,
            path: childPath,
            layerId: layer.do_objectID,
            symbolId: layer.symbolID,
            isRoot: false,
          });
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
}
