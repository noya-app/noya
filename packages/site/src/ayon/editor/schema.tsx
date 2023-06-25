import { Node, Element as SlateElement, Transforms } from 'slate';
import { Blocks } from '../blocks/blocks';
import { flattenPassthroughLayers } from '../blocks/flattenPassthroughLayers';
import {
  CustomEditor,
  EditorSchema,
  EditorSchemaElement,
  ParagraphElement,
} from './types';

export function withSchema(schema: EditorSchema, editor: CustomEditor) {
  const { normalizeNode } = editor;

  editor.schema = schema;

  editor.normalizeNode = ([node, path]) => {
    const symbol = Blocks[editor.schema[0].symbolId].symbol;
    const layers = flattenPassthroughLayers(symbol);

    // If this is the editor
    if (path.length === 0) {
      // Ensure there's a node for each layer and the container
      while (editor.children.length < editor.schema.length) {
        const schemaElement = editor.schema[editor.children.length];

        const paragraph: ParagraphElement = {
          type: 'paragraph',
          children: [{ text: '' }],
          ...schemaElement,
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

        const schemaElement = editor.schema[index];

        Transforms.setNodes<SlateElement>(editor, schemaElement, {
          at: childPath,
        });
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
}

export function createSchema(rootElement: EditorSchemaElement): EditorSchema {
  const block = Blocks[rootElement.symbolId];

  const layers = flattenPassthroughLayers(block.symbol);

  const children = layers.map(
    (layer): EditorSchemaElement => ({
      symbolId: layer.symbolID,
      layerPath: [layer.do_objectID],
      isRoot: false,
    }),
  );

  return [rootElement, ...children];
}
