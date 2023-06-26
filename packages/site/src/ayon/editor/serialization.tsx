import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { BlockContent, Overrides } from 'noya-state';
import { Descendant, Node } from 'slate';
import { flattenPassthroughLayers } from '../blocks/flattenPassthroughLayers';
import { ParagraphElement } from './types';

export type EditorBlockContent = Omit<
  Required<BlockContent>,
  'normalizedText'
> & {
  layerPath: string[];
};

export function toContent(
  symbol: Sketch.SymbolMaster,
  nodes: Descendant[],
): EditorBlockContent {
  const children = flattenPassthroughLayers(symbol);
  const overrides: Sketch.OverrideValue[] = [];

  for (let i = 0; i < children.length; i++) {
    const { layerPath } = children[i];
    const node = nodes[i + 1];
    const value = node ? Node.string(node) : '';

    overrides.push(
      SketchModel.overrideValue({
        overrideName: Overrides.encodeName(layerPath, 'blockText'),
        value,
      }),
    );
  }

  const rootNode = nodes[0] as ParagraphElement;

  return {
    symbolId: symbol.symbolID,
    blockText: nodes.length > children.length ? Node.string(rootNode) : '',
    overrides: overrides,
    layerPath: [],
  };
}

export function extractBlockContent(
  instance: Sketch.SymbolInstance,
): EditorBlockContent {
  return {
    blockText: instance.blockText ?? '',
    overrides: instance.overrideValues,
    symbolId: instance.symbolID,
    layerPath: [],
  };
}

export function fromContent(
  symbol: Sketch.SymbolMaster,
  content: EditorBlockContent,
): Descendant[] {
  const children = flattenPassthroughLayers(symbol);

  const layerNodes = children.map(
    ({ layer, layerPath, indent }): ParagraphElement => {
      const value = Overrides.getOverrideValue(
        content.overrides ?? [],
        layerPath.join('/'),
        'blockText',
      );

      return {
        type: 'paragraph',
        children: [{ text: value ?? '' }],
        symbolId: layer.symbolID,
        layerPath: layerPath,
        isRoot: false,
      };
    },
  );

  const rootNode: ParagraphElement = {
    type: 'paragraph',
    children: [{ text: content.blockText ?? '' }],
    symbolId: content.symbolId,
    layerPath: [],
    isRoot: true,
  };

  return [rootNode, ...layerNodes];
}

export function toString(value: Descendant[]): string {
  return value.map((n) => Node.string(n)).join('\n');
}
